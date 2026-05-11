package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.DocumentResponseDao;
import com.ibrahim.parcvision.dao.DossierResponseDao;
import com.ibrahim.parcvision.entity.Document;
import com.ibrahim.parcvision.entity.DossierArchivage;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.repository.DocumentRepository;
import com.ibrahim.parcvision.repository.DossierArchivageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
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
    public List<DossierResponseDao> getChildren(Long dossierId) {
        DossierArchivage parent = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
        return dossierRepo.findByParent(parent)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Returns the documents inside a given folder.
     */
    @Transactional(readOnly = true)
    public List<DocumentResponseDao> getDocuments(Long dossierId) {
        DossierArchivage dossier = dossierRepo.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier introuvable : " + dossierId));
        return documentRepo.findByDossier(dossier)
                .stream()
                .map(this::toDocDto)
                .collect(Collectors.toList());
    }

    // ── Folder creation ───────────────────────────────────────────────────────

    @Transactional
    public DossierResponseDao createFolder(Long parentId, String nom, Entreprise entreprise) {
        DossierArchivage parent = dossierRepo.findById(parentId)
                .orElseThrow(() -> new RuntimeException("Dossier parent introuvable : " + parentId));

        // Duplicate check
        boolean exists = dossierRepo.findByParent(parent)
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
