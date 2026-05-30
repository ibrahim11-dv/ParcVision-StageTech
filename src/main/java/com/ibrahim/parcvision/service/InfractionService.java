package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.InfractionRequestDao;
import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Infraction;
import com.ibrahim.parcvision.entity.Mission;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.repository.ConducteurRepository;
import com.ibrahim.parcvision.repository.InfractionRepository;
import com.ibrahim.parcvision.repository.MissionRepository;
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
public class InfractionService {

    private final InfractionRepository infractionRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ConducteurRepository conducteurRepository;
    private final MissionRepository missionRepository;
    private final FileStorageService fileStorageService;
    private final UtilisateurRepository utilisateurRepository;
    private final com.ibrahim.parcvision.repository.DepenseRepository depenseRepository;

    @Autowired
    public InfractionService(InfractionRepository infractionRepository,
                             VehiculeRepository vehiculeRepository,
                             ConducteurRepository conducteurRepository,
                             MissionRepository missionRepository,
                             FileStorageService fileStorageService,
                             UtilisateurRepository utilisateurRepository,
                             com.ibrahim.parcvision.repository.DepenseRepository depenseRepository) {
        this.infractionRepository = infractionRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.conducteurRepository = conducteurRepository;
        this.missionRepository = missionRepository;
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
    public Infraction ajouterInfraction(InfractionRequestDao dto) throws IOException {
        Entreprise entreprise = getCurrentEntreprise();

        Infraction infraction;
        if (dto.getId() != null) {
            infraction = infractionRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Infraction introuvable"));
            if (!infraction.getEntreprise().getId().equals(entreprise.getId())) {
                throw new RuntimeException("Accès refusé");
            }
        } else {
            infraction = new Infraction();
            infraction.setEntreprise(entreprise);
            // Initialisation des champs liés aux paiements pour une nouvelle infraction
            infraction.setDatePaiement(null);
            infraction.setEstPayee(false);
        }

        if (dto.getVehiculeId() != null) {
            Vehicule vehicule = vehiculeRepository.findById(dto.getVehiculeId())
                    .orElseThrow(() -> new RuntimeException("Véhicule introuvable"));
            infraction.setVehicule(vehicule);
        } else {
            infraction.setVehicule(null);
        }

        if (dto.getConducteurId() != null) {
            Conducteur conducteur = conducteurRepository.findById(dto.getConducteurId())
                    .orElseThrow(() -> new RuntimeException("Conducteur introuvable"));
            infraction.setConducteur(conducteur);
        } else {
            infraction.setConducteur(null);
        }

        if (dto.getMissionId() != null) {
            Mission mission = missionRepository.findById(dto.getMissionId())
                    .orElseThrow(() -> new RuntimeException("Mission introuvable"));
            infraction.setMission(mission);
        } else {
            infraction.setMission(null);
        }

        String fichierUrl = null;
        if (dto.getFichier() != null && !dto.getFichier().isEmpty()) {
            String dossier = extractDossier(infraction.getFichierInfractionUrl());
            if (dossier == null) {
                dossier = "infractions/" + UUID.randomUUID().toString();
            }
            if (infraction.getFichierInfractionUrl() != null) {
                fileStorageService.deleteFile(infraction.getFichierInfractionUrl());
            }
            fichierUrl = fileStorageService.storeFile(dto.getFichier(), dossier, "infraction_" + System.currentTimeMillis());
            infraction.setFichierInfractionUrl(fichierUrl);
        }

        infraction.setDateCommis(dto.getDateCommis());
        infraction.setCategorie(dto.getCategorie());
        infraction.setDescription(dto.getDescription());
        infraction.setDateLimitePaiement(dto.getDateLimitePaiement());
        infraction.setMontant(dto.getMontant());

        Infraction saved = infractionRepository.save(infraction);
        syncDepense(saved);
        return saved;
    }

    @Transactional(readOnly = true)
    public Page<Infraction> listerInfractions(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Entreprise entreprise = getCurrentEntreprise();
        
        if (search != null && !search.isBlank()) {
            return infractionRepository.findBySearch(search, entreprise, pageable);
        } else {
            return infractionRepository.findByEntreprise(entreprise, pageable);
        }
    }
    
    @Transactional
    public void supprimerInfraction(Long id) {
        Infraction infraction = infractionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Infraction introuvable"));
                
        Entreprise currentEntreprise = getCurrentEntreprise();
        if (!infraction.getEntreprise().getId().equals(currentEntreprise.getId())) {
            throw new RuntimeException("Accès refusé pour cette infraction");
        }

        // Supprimer la dépense associée
        String sourceCustom = "Infraction #" + id;
        depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .ifPresent(d -> depenseRepository.delete(d));

        infractionRepository.delete(infraction);
    }

    private void syncDepense(Infraction inf) {
        String sourceCustom = "Infraction #" + inf.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(inf.getMontant() != null ? inf.getMontant() : 0.0);
        depense.setDateDepense(inf.getDateCommis());
        depense.setQui("Amende — " + (inf.getCategorie() != null ? inf.getCategorie() : "Inconnue"));
        depense.setSourceDepense("Infraction");
        depense.setSourceDepenseCustom(sourceCustom);
        
        if (Boolean.TRUE.equals(inf.getEstPayee())) {
            depense.setTypePaiement(com.ibrahim.parcvision.enums.TypePaiement.PAYE);
        } else {
            depense.setTypePaiement(com.ibrahim.parcvision.enums.TypePaiement.EN_ATTENTE);
        }
        
        depense.setEntreprise(inf.getEntreprise());
        depenseRepository.save(depense);
    }

    private String extractDossier(String url) {
        if (url != null && !url.isBlank()) {
            String[] parts = url.split("/");
            if (parts.length >= 3) {
                return "infractions/" + parts[2];
            }
        }
        return null;
    }
}
