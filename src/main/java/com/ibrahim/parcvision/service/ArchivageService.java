package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.DocumentResponseDao;
import com.ibrahim.parcvision.dao.DossierResponseDao;
import com.ibrahim.parcvision.dao.SearchSuggestionDao;
import com.ibrahim.parcvision.entity.Document;
import com.ibrahim.parcvision.entity.DossierArchivage;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.repository.DocumentRepository;
import com.ibrahim.parcvision.repository.DossierArchivageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.data.domain.Sort;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.util.FileSystemUtils;
import org.springframework.scheduling.annotation.Async;
import java.io.File;

@Service
public class ArchivageService {

    private final DossierArchivageRepository dossierRepo;
    private final DocumentRepository documentRepo;

    @Value("${archivage.upload-dir:uploads/archivage}")
    private String uploadDir;

    private final OCRService ocrService;

    public ArchivageService(DossierArchivageRepository dossierRepo,
                            DocumentRepository documentRepo,
                            OCRService ocrService) {
        this.dossierRepo  = dossierRepo;
        this.documentRepo = documentRepo;
        this.ocrService   = ocrService;
    }

    // ── Root folder ───────────────────────────────────────────────────────────

    /**
     * Get or create the root "/" folder for the enterprise.
     */
    @Transactional
    public DossierArchivage getOrCreateRoot(Entreprise entreprise) {
        return dossierRepo.findByEntrepriseAndParentIsNullAndNom(entreprise, "/")
                .orElseGet(() -> {
                    DossierArchivage root = new DossierArchivage("/", "/", null, entreprise);
                    return dossierRepo.save(root);
                });
    }

    // ── Folder tree ───────────────────────────────────────────────────────────

    /**
     * Returns the children (sub-folders) of a given folder as response DAOs.
     */
    @Transactional(readOnly = true)
    public List<DossierResponseDao> getChildren(Long dossierId, String sortBy, String direction) {
        DossierArchivage parent = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
        
        // Folders only support sorting by 'nom'
        String field = "nom".equalsIgnoreCase(sortBy) || "nomFichier".equalsIgnoreCase(sortBy) ? "nom" : "nom";
        Sort sort = createSort(field, direction, "nom");

        return dossierRepo.findByParent(parent, sort)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns the documents inside a given folder.
     */
    @Transactional(readOnly = true)
    public List<DocumentResponseDao> getDocuments(Long dossierId, String sortBy, String direction) {
        DossierArchivage dossier = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
        
        // Validate document fields
        List<String> validFields = List.of("nomFichier", "taille", "typeMime", "dateUpload");
        String field = validFields.contains(sortBy) ? sortBy : "nomFichier";
        
        Sort sort = createSort(field, direction, "nomFichier");
        return documentRepo.findByDossier(dossier, sort)
                .stream()
                .map(this::toDocDto)
                .collect(Collectors.toList());
    }

    private Sort createSort(String sortBy, String direction, String defaultSort) {
        String field = (sortBy == null || sortBy.isBlank()) ? defaultSort : sortBy;
        Sort.Direction dir = "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(dir, field);
    }

    // ── Folder creation ───────────────────────────────────────────────────────

    @Transactional
    public DossierResponseDao createFolder(Long parentId, String nom, Entreprise entreprise) {
        DossierArchivage parent = dossierRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Dossier parent introuvable : " + parentId));

        // Duplicate check
        boolean exists = dossierRepo.findByParent(parent, Sort.unsorted())
                .stream()
                .anyMatch(d -> d.getNom().equalsIgnoreCase(nom));
        if (exists) throw new RuntimeException("Un dossier nommé \"" + nom + "\" existe déjà ici.");

        String chemin = parent.getChemin().equals("/")
                ? "/" + nom
                : parent.getChemin() + "/" + nom;

        DossierArchivage newFolder = new DossierArchivage(nom, chemin, parent, entreprise);
        return toDto(dossierRepo.save(newFolder));
    }

    // ── Folder deletion ───────────────────────────────────────────────────────

    @Transactional
    public void deleteFolder(Long dossierId) {
        DossierArchivage dossier = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
        
        // Delete the physical directory
        String entrepriseNom = dossier.getEntreprise().getNom().replaceAll("[^a-zA-Z0-9._\\-]", "_");
        String dossierChemin = dossier.getChemin();
        if (dossierChemin.startsWith("/")) {
            dossierChemin = dossierChemin.substring(1);
        }
        Path dir = Paths.get(uploadDir, entrepriseNom, dossierChemin).toAbsolutePath().normalize();
        try {
            FileSystemUtils.deleteRecursively(dir);
        } catch (IOException e) {
            System.err.println("Failed to delete directory: " + dir);
        }

        // CascadeType.ALL + orphanRemoval handles recursive deletion via JPA
        dossierRepo.delete(dossier);
    }

    // ── File upload ───────────────────────────────────────────────────────────

    @Transactional
    public DocumentResponseDao uploadFile(Long dossierId, MultipartFile file, String description) throws IOException {
        DossierArchivage dossier = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));

        // Build storage path: uploadDir/<entrepriseNom>/<dossier.chemin>/<uuid>_<originalName>
        String entrepriseNom = dossier.getEntreprise().getNom().replaceAll("[^a-zA-Z0-9._\\-]", "_");
        String safeOriginal = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._\\-]", "_")
                : "fichier";
        String storedName = UUID.randomUUID() + "_" + safeOriginal;

        String dossierChemin = dossier.getChemin();
        if (dossierChemin.startsWith("/")) {
            dossierChemin = dossierChemin.substring(1); // avoid absolute path resolution
        }

        Path dir = Paths.get(uploadDir, entrepriseNom, dossierChemin).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        Path dest = dir.resolve(storedName);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        Document doc = new Document();
        doc.setNomFichier(file.getOriginalFilename());
        doc.setTypeMime(file.getContentType());
        doc.setTaille(file.getSize());
        doc.setCheminStockage(dest.toString());
        doc.setDateUpload(LocalDateTime.now());
        doc.setDescription(description);
        doc.setDossier(dossier);

        Document savedDoc = documentRepo.save(doc);

        // Trigger OCR asynchronously via the external service
        ocrService.processOCRAsync(savedDoc.getId());

        return toDocDto(savedDoc);
    }



    // ── File deletion ─────────────────────────────────────────────────────────

    @Transactional
    public void deleteFile(Long documentId) throws IOException {
        Document doc = documentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));
        // Delete physical file
        if (doc.getCheminStockage() != null) {
            Path path = Paths.get(doc.getCheminStockage()).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
        }
        documentRepo.delete(doc);
    }

    @Transactional(readOnly = true)
    public List<SearchSuggestionDao> search(String query, Entreprise entreprise) {
        if (query == null || query.trim().length() < 2) return new ArrayList<>();
        String q = query.trim().toLowerCase();

        List<SearchSuggestionDao> suggestions = new ArrayList<>();

        // 1. Search Dossiers by name
        List<DossierArchivage> dossiers = dossierRepo.searchDossiers(entreprise, q);
        for (DossierArchivage d : dossiers) {
            SearchSuggestionDao s = new SearchSuggestionDao();
            s.setId(d.getId());
            s.setType("FOLDER");
            s.setName(d.getNom());
            s.setMatchType("NAME");
            s.setDossierId(d.getId()); // Navigate to this folder
            s.setDossierNom(d.getNom());
            s.setChemin(d.getChemin());
            suggestions.add(s);
        }

        // 2. Search Documents by name or OCR
        List<Document> documents = documentRepo.searchDocuments(entreprise, q);
        for (Document doc : documents) {
            SearchSuggestionDao s = new SearchSuggestionDao();
            s.setId(doc.getId());
            s.setType("FILE");
            s.setName(doc.getNomFichier());
            s.setDossierId(doc.getDossier().getId());
            s.setDossierNom(doc.getDossier().getNom());
            s.setChemin(doc.getDossier().getChemin());

            // Check if match is in name or content
            if (doc.getNomFichier().toLowerCase().contains(q)) {
                s.setMatchType("NAME");
            } else if (doc.getOcrContent() != null && doc.getOcrContent().toLowerCase().contains(q)) {
                s.setMatchType("CONTENT");
                s.setContext(extractContext(doc.getOcrContent(), q));
            } else {
                s.setMatchType("NAME"); // Fallback
            }
            suggestions.add(s);
        }

        // Limit to top 15 results
        return suggestions.stream().limit(15).collect(Collectors.toList());
    }

    private String extractContext(String text, String query) {
        if (text == null || query == null) return "";
        int idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx == -1) return "";

        int start = Math.max(0, idx - 40);
        int end   = Math.min(text.length(), idx + query.length() + 40);

        String snippet = text.substring(start, end).replace("\n", " ").replace("\r", " ");
        return (start > 0 ? "..." : "") + snippet + (end < text.length() ? "..." : "");
    }

    @Transactional(readOnly = true)
    public Document getDocumentEntity(Long documentId) {
        return documentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document introuvable : " + documentId));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private DossierResponseDao toDto(DossierArchivage d) {
        DossierResponseDao dto = new DossierResponseDao();
        dto.setId(d.getId());
        dto.setNom(d.getNom());
        dto.setChemin(d.getChemin());
        dto.setParentId(d.getParent() != null ? d.getParent().getId() : null);
        dto.setNombreSousDossiers(d.getSousDossiers() != null ? d.getSousDossiers().size() : 0);
        dto.setNombreDocuments(d.getDocuments() != null ? d.getDocuments().size() : 0);
        return dto;
    }

    private DocumentResponseDao toDocDto(Document doc) {
        DocumentResponseDao dto = new DocumentResponseDao();
        dto.setId(doc.getId());
        dto.setNomFichier(doc.getNomFichier());
        dto.setTypeMime(doc.getTypeMime());
        dto.setTaille(doc.getTaille());
        dto.setDescription(doc.getDescription());
        dto.setDateUpload(doc.getDateUpload());
        dto.setDossierId(doc.getDossier().getId());
        dto.setOcrContent(doc.getOcrContent());
        return dto;
    }
}
