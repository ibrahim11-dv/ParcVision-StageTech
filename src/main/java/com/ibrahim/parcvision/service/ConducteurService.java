package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.ConducteurRequestDao;
import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
import com.ibrahim.parcvision.enums.Statut;
import com.ibrahim.parcvision.repository.ConducteurRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.*;

@Service
public class ConducteurService {

    @Autowired
    private ConducteurRepository conducteurRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---------- AJOUT ----------
    @Transactional
    public Conducteur ajouterConducteur(ConducteurRequestDao dto) throws IOException {
        String emailAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur admin = utilisateurRepository.findByEmail(emailAdmin)
                .orElseThrow(() -> new RuntimeException("Administrateur non trouvé"));
        if (admin.getEntreprise() == null) {
            throw new RuntimeException("L'administrateur n'est rattaché à aucune entreprise");
        }

        String dossier = "conducteurs/" + UUID.randomUUID().toString();

        String photoUrl = fileStorageService.storeFile(dto.getPhotoProfile(), dossier, "photo_profile");
        String scanCinUrl = fileStorageService.storeFile(dto.getScanCin(), dossier, "scan_cin");
        String scanPermisUrl = fileStorageService.storeFile(dto.getScanPermis(), dossier, "scan_permis");

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(dto.getNom());
        utilisateur.setPrenom(dto.getPrenom());
        utilisateur.setDateNaissance(dto.getDateNaissance());
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setTelephone(dto.getTelephone());
        utilisateur.setCin(dto.getCin());
        utilisateur.setPassword(passwordEncoder.encode(dto.getMotDePasse()));
        utilisateur.setRole(Role.CONDUCTEUR);
        utilisateur.setEntreprise(admin.getEntreprise());
        utilisateur = utilisateurRepository.save(utilisateur);

        Conducteur conducteur = new Conducteur();
        conducteur.setUtilisateur(utilisateur);
        conducteur.setNumeroPermis(dto.getNumeroPermis());
        conducteur.setDateValiditePermis(dto.getDateValiditePermis());
        conducteur.setDateEmbauche(dto.getDateEmbauche());
        conducteur.setStatut(dto.getStatut() != null ? Statut.valueOf(dto.getStatut().toUpperCase()) : Statut.DISPONIBLE);
        conducteur.setPhotoProfileUrl(photoUrl);
        conducteur.setScanCinUrl(scanCinUrl);
        conducteur.setScanPermisUrl(scanPermisUrl);

        return conducteurRepository.save(conducteur);
    }

    // ---------- LISTE PAGINÉE + RECHERCHE + FILTRE ----------
    @Transactional(readOnly = true)
    public Page<Conducteur> listerConducteurs(int page, int size, String search, String statut) {
        Pageable pageable = PageRequest.of(page, size);
        Entreprise entreprise = getCurrentEntreprise();

        if (search != null && !search.isBlank() && statut != null && !statut.isBlank()) {
            return conducteurRepository.findBySearchAndStatut(search, Statut.valueOf(statut.toUpperCase()), entreprise, pageable);
        } else if (search != null && !search.isBlank()) {
            return conducteurRepository.findBySearch(search, entreprise, pageable);
        } else if (statut != null && !statut.isBlank()) {
            return conducteurRepository.findByStatutAndUtilisateurEntreprise(Statut.valueOf(statut.toUpperCase()), entreprise, pageable);
        } else {
            return conducteurRepository.findByUtilisateurEntreprise(entreprise, pageable);
        }
    }

    // ---------- DÉTAIL ----------
    @Transactional(readOnly = true)
    public Conducteur getConducteur(Long id) {
        return conducteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conducteur introuvable"));
    }

    // ---------- MODIFICATION ----------
    @Transactional
    public Conducteur modifierConducteur(Long id, ConducteurRequestDao dto) throws IOException {
        Conducteur conducteur = getConducteur(id);
        Utilisateur utilisateur = conducteur.getUtilisateur();

        // Mise à jour des champs utilisateur
        if (dto.getNom() != null) utilisateur.setNom(dto.getNom());
        if (dto.getPrenom() != null) utilisateur.setPrenom(dto.getPrenom());
        if (dto.getDateNaissance() != null) utilisateur.setDateNaissance(dto.getDateNaissance());
        if (dto.getEmail() != null) utilisateur.setEmail(dto.getEmail());
        if (dto.getTelephone() != null) utilisateur.setTelephone(dto.getTelephone());
        if (dto.getCin() != null) utilisateur.setCin(dto.getCin());
        if (dto.getMotDePasse() != null && !dto.getMotDePasse().isBlank()) {
            utilisateur.setPassword(passwordEncoder.encode(dto.getMotDePasse()));
        }

        // Mise à jour des champs conducteur
        if (dto.getNumeroPermis() != null) conducteur.setNumeroPermis(dto.getNumeroPermis());
        if (dto.getDateValiditePermis() != null) conducteur.setDateValiditePermis(dto.getDateValiditePermis());
        if (dto.getDateEmbauche() != null) conducteur.setDateEmbauche(dto.getDateEmbauche());
        if (dto.getStatut() != null) conducteur.setStatut(Statut.valueOf(dto.getStatut().toUpperCase()));

        // --- Dossier unique : on récupère le dossier existant via n'importe quel fichier déjà présent ---
        String dossier = null;
        if (conducteur.getPhotoProfileUrl() != null) {
            dossier = extractDossier(conducteur.getPhotoProfileUrl());
        } else if (conducteur.getScanCinUrl() != null) {
            dossier = extractDossier(conducteur.getScanCinUrl());
        } else if (conducteur.getScanPermisUrl() != null) {
            dossier = extractDossier(conducteur.getScanPermisUrl());
        }
        // Si aucun fichier n'existe encore, on crée un nouveau dossier
        if (dossier == null) {
            dossier = UUID.randomUUID().toString();
        }

        // Photo de profil
        if (dto.getPhotoProfile() != null && !dto.getPhotoProfile().isEmpty()) {
            fileStorageService.deleteFile(conducteur.getPhotoProfileUrl());
            String timestamp = String.valueOf(System.currentTimeMillis());
            String newPhotoUrl = fileStorageService.storeFile(dto.getPhotoProfile(), dossier, "photo_profile_" + timestamp);
            if (newPhotoUrl != null) conducteur.setPhotoProfileUrl(newPhotoUrl);
        }

        // Scan CIN
        if (dto.getScanCin() != null && !dto.getScanCin().isEmpty()) {
            fileStorageService.deleteFile(conducteur.getScanCinUrl());
            String newScanCinUrl = fileStorageService.storeFile(dto.getScanCin(), dossier, "scan_cin");
            if (newScanCinUrl != null) conducteur.setScanCinUrl(newScanCinUrl);
        }

        // Scan Permis
        if (dto.getScanPermis() != null && !dto.getScanPermis().isEmpty()) {
            fileStorageService.deleteFile(conducteur.getScanPermisUrl());
            String newScanPermisUrl = fileStorageService.storeFile(dto.getScanPermis(), dossier, "scan_permis");
            if (newScanPermisUrl != null) conducteur.setScanPermisUrl(newScanPermisUrl);
        }

        utilisateurRepository.save(utilisateur);
        return conducteurRepository.save(conducteur);
    }

    // ---------- SUPPRESSION ----------
    @Transactional
    public void supprimerConducteur(Long id) {
        Conducteur conducteur = getConducteur(id);
        Utilisateur utilisateur = conducteur.getUtilisateur();
        conducteurRepository.delete(conducteur);
        utilisateurRepository.delete(utilisateur);
    }

    // ---------- STATISTIQUES ----------
    @Transactional(readOnly = true)
    public Map<String, Long> getStats() {
        Entreprise entreprise = getCurrentEntreprise();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", conducteurRepository.countByUtilisateurEntreprise(entreprise));
        stats.put("disponible", conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.DISPONIBLE, entreprise));
        stats.put("mission", conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.EN_MISSION, entreprise));
        stats.put("conge", conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.EN_CONGE, entreprise));
        return stats;
    }

    private Entreprise getCurrentEntreprise() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        if (user.getEntreprise() == null) {
            throw new RuntimeException("L'utilisateur n'est rattaché à aucune entreprise");
        }
        return user.getEntreprise();
    }

    // ---------- MÉTHODE UTILITAIRE ----------
    /**
     * Extrait le nom du dossier (UUID) à partir d'une URL de fichier.
     * Exemple : "uploads/conducteurs/550e8400.../photo_profile.png" → "550e8400..."
     */
    private String extractDossier(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return "conducteurs/" + UUID.randomUUID().toString();
        // L'URL est sous la forme "uploads/conducteurs/<uuid>/fichier"
        String[] parts = fileUrl.split("/");
        if (parts.length >= 3) {
            return "conducteurs/" + parts[2];   // On retourne "conducteurs/UUID"
        }
        return "conducteurs/" + UUID.randomUUID().toString();
    }
}