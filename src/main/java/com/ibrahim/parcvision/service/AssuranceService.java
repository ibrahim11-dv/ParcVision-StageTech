package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.AssuranceRequestDao;
import com.ibrahim.parcvision.entity.Assurance;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.repository.AssuranceRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.UUID;

@Service
public class AssuranceService {

    private final AssuranceRepository assuranceRepository;
    private final VehiculeRepository vehiculeRepository;
    private final FileStorageService fileStorageService;
    private final UtilisateurRepository utilisateurRepository;
    private final com.ibrahim.parcvision.repository.DepenseRepository depenseRepository;

    @Autowired
    public AssuranceService(AssuranceRepository assuranceRepository,
                            VehiculeRepository vehiculeRepository,
                            FileStorageService fileStorageService,
                            UtilisateurRepository utilisateurRepository,
                            com.ibrahim.parcvision.repository.DepenseRepository depenseRepository) {
        this.assuranceRepository = assuranceRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.fileStorageService = fileStorageService;
        this.utilisateurRepository = utilisateurRepository;
        this.depenseRepository = depenseRepository;
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

    @Transactional
    public Assurance ajouterAssurance(AssuranceRequestDao dto) throws IOException {
        Vehicule vehicule = vehiculeRepository.findById(dto.getVehiculeId())
                .orElseThrow(() -> new RuntimeException("Véhicule introuvable"));

        // Vérifier si le véhicule appartient bien à l'entreprise de l'admin
        Entreprise currentEntreprise = getCurrentEntreprise();
        if (!vehicule.getEntreprise().getId().equals(currentEntreprise.getId())) {
            throw new RuntimeException("Accès refusé pour ce véhicule");
        }

        // On détermine le dossier du véhicule où on va stocker la nouvelle attestation
        // On cherche un dossier existant à partir de l'ancienne URL d'assurance ou d'autres fichiers du véhicule
        String dossier = extractDossier(vehicule.getScanAssuranceUrl(), vehicule.getScanCarteGriseUrl(), vehicule.getImagesUrls());
        if (dossier == null) {
            dossier = "vehicules/" + UUID.randomUUID().toString();
        }

        Assurance assurance;
        if (dto.getId() != null) {
            assurance = assuranceRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Assurance introuvable"));
            if (!assurance.getVehicule().getEntreprise().getId().equals(currentEntreprise.getId())) {
                throw new RuntimeException("Accès refusé");
            }
        } else {
            assurance = new Assurance();
            assurance.setEstPayee(false);
        }

        String attestationUrl = null;
        if (dto.getAttestation() != null && !dto.getAttestation().isEmpty()) {
            if (assurance.getAttestationUrl() != null) {
                fileStorageService.deleteFile(assurance.getAttestationUrl());
            }
            attestationUrl = fileStorageService.storeFile(dto.getAttestation(), dossier, "assurance_" + System.currentTimeMillis());
            
            // Mise à jour de l'URL dans le Véhicule pour être "l'assurance actuelle"
            vehicule.setScanAssuranceUrl(attestationUrl);
        }

        // Mise à jour de la date d'expiration dans le Véhicule
        if (dto.getDateExpiration() != null) {
            vehicule.setDateExpirationAssurance(dto.getDateExpiration());
        }
        
        vehiculeRepository.save(vehicule);

        assurance.setVehicule(vehicule);
        assurance.setTypeAssurance(dto.getTypeAssurance());
        assurance.setDateDebut(dto.getDateDebut());
        assurance.setDateExpiration(dto.getDateExpiration());
        assurance.setNombreMois(dto.getNombreMois());
        assurance.setNomPrestataire(dto.getNomPrestataire());
        assurance.setMontant(dto.getMontant());
        if (attestationUrl != null) {
            assurance.setAttestationUrl(attestationUrl);
        }

        Assurance saved = assuranceRepository.save(assurance);
        syncDepense(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Assurance> listerAssurances(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Entreprise entreprise = getCurrentEntreprise();
        
        if (search != null && !search.isBlank()) {
            return assuranceRepository.findBySearch(search, entreprise, pageable);
        } else {
            return assuranceRepository.findByEntreprise(entreprise, pageable);
        }
    }
    
    @Transactional
    public void supprimerAssurance(Long id) {
        Assurance assurance = assuranceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assurance introuvable"));
                
        Entreprise currentEntreprise = getCurrentEntreprise();
        if (!assurance.getVehicule().getEntreprise().getId().equals(currentEntreprise.getId())) {
            throw new RuntimeException("Accès refusé pour cette assurance");
        }

        // Supprimer la dépense associée
        String sourceCustom = "Assurance #" + id;
        depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .ifPresent(d -> depenseRepository.delete(d));

        // On ne supprime pas le fichier physique pour l'historique
        assuranceRepository.delete(assurance);
    }

    private void syncDepense(Assurance ass) {
        String sourceCustom = "Assurance #" + ass.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(ass.getMontant() != null ? ass.getMontant() : 0.0);
        depense.setDateDepense(ass.getDateDebut());
        depense.setQui(ass.getNomPrestataire() != null ? ass.getNomPrestataire() : "Assureur Inconnu");
        depense.setSourceDepense("Assurance");
        depense.setSourceDepenseCustom(sourceCustom);
        
        // On mappe l'état de paiement
        depense.setEstPayee(Boolean.TRUE.equals(ass.getEstPayee()));
        
        depense.setEntreprise(getCurrentEntreprise());
        depenseRepository.save(depense);
    }

    /**
     * Extrait le nom du dossier (UUID) à partir de la première URL non vide parmi plusieurs.
     */
    private String extractDossier(String... fileUrls) {
        for (String url : fileUrls) {
            if (url != null && !url.isBlank()) {
                String[] parts = url.split("/");
                if (parts.length >= 3) {
                    return "vehicules/" + parts[2];
                }
            }
        }
        return null;
    }
}
