package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.VehiculeRequestDao;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.enums.StatutVehicule;
import com.ibrahim.parcvision.enums.TypeVehicule;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class VehiculeService {

    private final VehiculeRepository vehiculeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FileStorageService fileStorageService;

    @Autowired
    public VehiculeService(VehiculeRepository vehiculeRepository,
                           UtilisateurRepository utilisateurRepository,
                           FileStorageService fileStorageService) {
        this.vehiculeRepository = vehiculeRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public Vehicule ajouterVehicule(VehiculeRequestDao dto) throws IOException {
        String emailAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur admin = utilisateurRepository.findByEmail(emailAdmin)
                .orElseThrow(() -> new RuntimeException("Administrateur non trouvé"));
        if (admin.getEntreprise() == null) {
            throw new RuntimeException("L'administrateur n'est rattaché à aucune entreprise");
        }

        String dossier = "vehicules/" + UUID.randomUUID().toString();

        // Stocker les images multiples
        List<String> imagesUrls = new ArrayList<>();
        if (dto.getImagesVehicule() != null) {
            for (int i = 0; i < dto.getImagesVehicule().size(); i++) {
                MultipartFile file = dto.getImagesVehicule().get(i);
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file, dossier, "image_" + i);
                    if (url != null) imagesUrls.add(url);
                }
            }
        }

        String scanCarteGriseUrl = fileStorageService.storeFile(dto.getScanCarteGrise(), dossier, "carte_grise");
        String scanAssuranceUrl = fileStorageService.storeFile(dto.getScanAssurance(), dossier, "assurance");

        Vehicule vehicule = new Vehicule();
        vehicule.setImmatriculation(dto.getImmatriculation());
        vehicule.setMarque(dto.getMarque());
        vehicule.setModel(dto.getModel());
        vehicule.setKilometrageActuel(dto.getKilometrageActuel());
        vehicule.setCarburant(dto.getCarburant());
        vehicule.setDateExpirationAssurance(dto.getDateExpirationAssurance());
        vehicule.setDateProchainControleTechnique(dto.getDateProchainControleTechnique());
        vehicule.setCapaciteChargeKg(dto.getCapaciteChargeKg());
        vehicule.setDateMiseCirculation(dto.getDateMiseCirculation());

        if (dto.getTypeVehicule() != null) {
            vehicule.setTypeVehicule(TypeVehicule.valueOf(dto.getTypeVehicule().toUpperCase()));
        }
        if (dto.getStatutVehicule() != null) {
            vehicule.setStatutVehicule(StatutVehicule.valueOf(dto.getStatutVehicule().toUpperCase()));
        } else {
            vehicule.setStatutVehicule(StatutVehicule.DISPONIBLE);
        }

        vehicule.setImagesUrls(String.join(",", imagesUrls));
        vehicule.setScanCarteGriseUrl(scanCarteGriseUrl);
        vehicule.setScanAssuranceUrl(scanAssuranceUrl);
        vehicule.setEntreprise(admin.getEntreprise());

        return vehiculeRepository.save(vehicule);
    }

    @Transactional(readOnly = true)
    public Page<Vehicule> listerVehicules(int page, int size, String search, String statut) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        Entreprise entreprise = getCurrentEntreprise();

        if (search != null && !search.isBlank() && statut != null && !statut.isBlank()) {
            return vehiculeRepository.findBySearchAndStatut(search, StatutVehicule.valueOf(statut.toUpperCase()), entreprise, pageable);
        } else if (search != null && !search.isBlank()) {
            return vehiculeRepository.findBySearch(search, entreprise, pageable);
        } else if (statut != null && !statut.isBlank()) {
            return vehiculeRepository.findByStatutVehiculeAndEntreprise(StatutVehicule.valueOf(statut.toUpperCase()), entreprise, pageable);
        } else {
            return vehiculeRepository.findByEntreprise(entreprise, pageable);
        }
    }

    @Transactional(readOnly = true)
    public Vehicule getVehicule(Long id) {
        return vehiculeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Véhicule introuvable"));
    }

    @Transactional
    public Vehicule modifierVehicule(Long id, VehiculeRequestDao dto) throws IOException {
        Vehicule vehicule = getVehicule(id);

        if (dto.getImmatriculation() != null) vehicule.setImmatriculation(dto.getImmatriculation());
        if (dto.getMarque() != null) vehicule.setMarque(dto.getMarque());
        if (dto.getModel() != null) vehicule.setModel(dto.getModel());
        if (dto.getKilometrageActuel() != null) vehicule.setKilometrageActuel(dto.getKilometrageActuel());
        if (dto.getCapaciteChargeKg() != null) vehicule.setCapaciteChargeKg(dto.getCapaciteChargeKg());
        if (dto.getCarburant() != null) vehicule.setCarburant(dto.getCarburant());
        if (dto.getDateExpirationAssurance() != null) vehicule.setDateExpirationAssurance(dto.getDateExpirationAssurance());
        if (dto.getDateProchainControleTechnique() != null) vehicule.setDateProchainControleTechnique(dto.getDateProchainControleTechnique());
        if (dto.getDateMiseCirculation() != null) vehicule.setDateMiseCirculation(dto.getDateMiseCirculation());
        if (dto.getTypeVehicule() != null) vehicule.setTypeVehicule(TypeVehicule.valueOf(dto.getTypeVehicule().toUpperCase()));
        if (dto.getStatutVehicule() != null) vehicule.setStatutVehicule(StatutVehicule.valueOf(dto.getStatutVehicule().toUpperCase()));

        // Déterminer le dossier existant à partir des URLs actuelles
        String dossier = extractDossier(vehicule.getImagesUrls(), vehicule.getScanCarteGriseUrl(), vehicule.getScanAssuranceUrl());
        if (dossier == null) dossier = UUID.randomUUID().toString();

        // Gestion des images multiples : on supprime les anciennes et on met les nouvelles
        boolean hasNewImages = false;
        if (dto.getImagesVehicule() != null) {
            for (MultipartFile file : dto.getImagesVehicule()) {
                if (file != null && !file.isEmpty()) {
                    hasNewImages = true;
                    break;
                }
            }
        }

        if (hasNewImages) {
            // Supprimer les anciens fichiers
            if (vehicule.getImagesUrls() != null && !vehicule.getImagesUrls().isBlank()) {
                String[] urls = vehicule.getImagesUrls().split(",");
                for (String url : urls) {
                    fileStorageService.deleteFile(url.trim());
                }
            }
            List<String> newUrls = new ArrayList<>();
            for (int i = 0; i < dto.getImagesVehicule().size(); i++) {
                MultipartFile file = dto.getImagesVehicule().get(i);
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file, dossier, "image_" + i + "_" + System.currentTimeMillis());
                    if (url != null) newUrls.add(url);
                }
            }
            vehicule.setImagesUrls(String.join(",", newUrls));
        }

        // Scan carte grise
        if (dto.getScanCarteGrise() != null && !dto.getScanCarteGrise().isEmpty()) {
            fileStorageService.deleteFile(vehicule.getScanCarteGriseUrl());
            String url = fileStorageService.storeFile(dto.getScanCarteGrise(), dossier, "carte_grise");
            if (url != null) vehicule.setScanCarteGriseUrl(url);
        }

        // Scan assurance
        if (dto.getScanAssurance() != null && !dto.getScanAssurance().isEmpty()) {
            fileStorageService.deleteFile(vehicule.getScanAssuranceUrl());
            String url = fileStorageService.storeFile(dto.getScanAssurance(), dossier, "assurance");
            if (url != null) vehicule.setScanAssuranceUrl(url);
        }

        return vehiculeRepository.save(vehicule);
    }

    @Transactional
    public void supprimerVehicule(Long id) {
        Vehicule vehicule = getVehicule(id);
        // On ne supprime plus les fichiers physiques pour les garder en archive
        vehiculeRepository.delete(vehicule);
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getStats() {
        Entreprise entreprise = getCurrentEntreprise();
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", vehiculeRepository.countByEntreprise(entreprise));
        stats.put("disponible", vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.DISPONIBLE, entreprise));
        stats.put("mission", vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.EN_MISSION, entreprise));
        stats.put("maintenance", vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.EN_MAINTENANCE, entreprise));
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

    public List<Vehicule> findAll() {
        Entreprise entreprise = getCurrentEntreprise();
        return vehiculeRepository.findByEntreprise(entreprise);
    }

    public Vehicule save(Vehicule vehicule) {
        return vehiculeRepository.save(vehicule);
    }

    /**
     * Extrait le nom du dossier (UUID) à partir de la première URL non vide parmi plusieurs.
     * Exemple : "uploads/vehicules/550e8400.../photo_profile.png" → "550e8400..."
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
        // Aucune URL exploitable → génère un nouvel UUID
        return "vehicules/" + UUID.randomUUID().toString();
    }
}
