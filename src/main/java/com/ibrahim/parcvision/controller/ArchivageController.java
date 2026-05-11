package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.DocumentResponseDao;
import com.ibrahim.parcvision.dao.DossierResponseDao;
import com.ibrahim.parcvision.entity.DossierArchivage;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.service.ArchivageService;
import com.ibrahim.parcvision.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/archivage")
public class ArchivageController {

    private final ArchivageService archivageService;
    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;

    public ArchivageController(ArchivageService archivageService,
                               JwtService jwtService,
                               UtilisateurRepository utilisateurRepository) {
        this.archivageService      = archivageService;
        this.jwtService            = jwtService;
        this.utilisateurRepository = utilisateurRepository;
    }

    // ── Helper ────────────────────────────────────────────
    private Utilisateur currentUser(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // ── GET root folder ───────────────────────────────────
    /**
     * Returns the root folder id for the current enterprise.
     * Creates it automatically on first call.
     */
    @GetMapping("/root")
    public ResponseEntity<?> getRoot(HttpServletRequest request) {
        try {
            Utilisateur user = currentUser(request);
            DossierArchivage root = archivageService.getOrCreateRoot(user.getEntreprise());
            return ResponseEntity.ok(Map.of(
                    "id",     root.getId(),
                    "nom",    root.getNom(),
                    "chemin", root.getChemin()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── GET children folders ──────────────────────────────
    @GetMapping("/{dossierId}/dossiers")
    public ResponseEntity<List<DossierResponseDao>> getChildren(
            @PathVariable Long dossierId) {
        return ResponseEntity.ok(archivageService.getChildren(dossierId));
    }

    // ── GET documents in folder ───────────────────────────
    @GetMapping("/{dossierId}/documents")
    public ResponseEntity<List<DocumentResponseDao>> getDocuments(
            @PathVariable Long dossierId) {
        return ResponseEntity.ok(archivageService.getDocuments(dossierId));
    }

    // ── POST create folder ────────────────────────────────
    @PostMapping("/{parentId}/dossiers")
    public ResponseEntity<?> createFolder(
            @PathVariable Long parentId,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        try {
            Utilisateur user = currentUser(request);
            String nom = body.get("nom");
            if (nom == null || nom.isBlank())
                return ResponseEntity.badRequest().body("Le nom du dossier est requis.");
            DossierResponseDao created = archivageService.createFolder(parentId, nom.trim(), user.getEntreprise());
            return ResponseEntity.status(201).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── DELETE folder ─────────────────────────────────────
    @DeleteMapping("/dossiers/{dossierId}")
    public ResponseEntity<?> deleteFolder(@PathVariable Long dossierId) {
        try {
            archivageService.deleteFolder(dossierId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── POST upload file(s) ───────────────────────────────
    @PostMapping("/{dossierId}/upload")
    public ResponseEntity<?> uploadFiles(
            @PathVariable Long dossierId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "description", required = false, defaultValue = "") String description) {
        try {
            List<DocumentResponseDao> uploaded = new ArrayList<>();
            for (MultipartFile file : files) {
                uploaded.add(archivageService.uploadFile(dossierId, file, description));
            }
            return ResponseEntity.status(201).body(uploaded);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'upload : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ── DELETE document ───────────────────────────────────
    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        try {
            archivageService.deleteFile(documentId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
