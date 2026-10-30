package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.repository.AccidentRepository;
import com.ibrahim.parcvision.repository.ConducteurRepository;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.FournisseurRepository;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.*;

@Service
public class AccidentService {

    private final AccidentRepository accidentRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private VehiculeRepository vehiculeRepository;

    @Autowired
    private ConducteurRepository conducteurRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DepenseRepository depenseRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    public AccidentService(AccidentRepository accidentRepository) {
        this.accidentRepository = accidentRepository;
    }

    public long countAccident() {
        return accidentRepository.countByVehiculeEntreprise(getCurrentEntreprise());
    }

    public long getNombreEnReparation() {
        return accidentRepository.countByEtat("En réparation", getCurrentEntreprise());
    }

    public double getTotalBudget() {
        Double result = accidentRepository.sumBudgetEstime(getCurrentEntreprise());
        return result != null ? result : 0.0;
    }

    public Page<Accident> Search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.searchByConducteurNom(query, getCurrentEntreprise(), pageable);
    }

    public Page<Accident> findByetat(String etat, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.findByEtat(etat, getCurrentEntreprise(), pageable);
    }

    public Page<Accident> AffichAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }

    @Transactional
    public Accident updateAccident(Long id, String etat, Double budgetEstime, String notes,
                                   List<String> deletedPhotos, MultipartFile[] newPhotos) throws IOException {
        return updateAccident(id, null, null, null, null, null, null, null, etat, budgetEstime, notes, deletedPhotos, newPhotos);
    }

    @Transactional
    public Accident updateAccident(Long id,
                                   Long vehiculeId,
                                   Long conducteurId,
                                   String dateIntervention,
                                   String lieu,
                                   String contexte,
                                   String gravite,
                                   String descriptionPanne,
                                   String etat,
                                   Double budgetEstime,
                                   String notes,
                                   List<String> deletedPhotos,
                                   MultipartFile[] newPhotos) throws IOException {
        Accident accident = accidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accident non trouvé"));

        if (vehiculeId != null) {
            Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
            accident.setVehicule(vehicule);
        }
        if (conducteurId != null) {
            Conducteur conducteur = conducteurRepository.findById(conducteurId)
                    .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));
            accident.setConducteur(conducteur);
        }
        if (dateIntervention != null && !dateIntervention.isBlank()) {
            String cleanDate = dateIntervention.contains("T") ? dateIntervention.split("T")[0] : dateIntervention;
            accident.setDateIntervention(LocalDate.parse(cleanDate));
        }
        if (lieu != null) {
            accident.setLieu(lieu);
        }
        if (contexte != null) {
            accident.setContexte(contexte);
        }
        if (gravite != null) {
            accident.setGravite(gravite);
        }
        if (descriptionPanne != null) {
            accident.setDescriptionPanne(descriptionPanne);
        }
        if (etat != null) {
            accident.setEtat(etat);
        }
        if (budgetEstime != null) {
            accident.setBudgetEstime(budgetEstime);
            accident.setCoutTotal(budgetEstime);
        }
        if (notes != null) {
            accident.setNotes(notes);
        }

        List<String> currentPhotos = accident.getPhotosUrl();
        if (currentPhotos == null) {
            currentPhotos = new ArrayList<>();
        }

        if (deletedPhotos != null && !deletedPhotos.isEmpty()) {
            for (String url : deletedPhotos) {
                fileStorageService.deleteFile(url);
                currentPhotos.remove(url);
            }
        }

        if (newPhotos != null && newPhotos.length > 0) {
            String dossier;
            if (!currentPhotos.isEmpty()) {
                dossier = extractDossier(currentPhotos.get(0));
            } else {
                dossier = "accidents/" + UUID.randomUUID().toString();
            }

            for (int i = 0; i < newPhotos.length; i++) {
                MultipartFile photo = newPhotos[i];
                if (photo != null && !photo.isEmpty()) {
                    String url = fileStorageService.storeFile(photo, dossier, "photo_" + i + "_" + System.currentTimeMillis());
                    if (url != null) {
                        currentPhotos.add(url);
                    }
                }
            }
        }

        accident.setPhotosUrl(currentPhotos);
        Accident saved = accidentRepository.save(accident);
        syncDepense(saved);
        return saved;
    }

    @Transactional
    public void deleteAccident(Long id) {
        Accident accident = accidentRepository.findById(id).orElse(null);
        if (accident != null) {
            if (accident.getPhotosUrl() != null) {
                for (String url : accident.getPhotosUrl()) {
                    fileStorageService.deleteFile(url);
                }
            }
            String sourceCustom = "Accident #" + id;
            depenseRepository.findAllBySourceDepenseCustom(sourceCustom)
                    .forEach(depenseRepository::delete);
            accidentRepository.delete(accident);
        }
    }

    @Transactional
    public Accident addAccident(Long vehiculeId, Long conducteurId, String dateIntervention, String descriptionPanne,
                                String lieu, String contexte, String gravite, String etat, Double budgetEstime,
                                MultipartFile[] photos) throws IOException {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
        Conducteur conducteur = conducteurRepository.findById(conducteurId)
                .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));

        Accident accident = new Accident();
        accident.setVehicule(vehicule);
        accident.setConducteur(conducteur);

        if (dateIntervention != null && dateIntervention.contains("T")) {
            dateIntervention = dateIntervention.split("T")[0];
        }
        accident.setDateIntervention(LocalDate.parse(dateIntervention));
        accident.setDescriptionPanne(descriptionPanne);
        accident.setLieu(lieu);
        accident.setContexte(contexte);
        accident.setGravite(gravite);
        accident.setEtat(etat);
        double budget = budgetEstime != null ? budgetEstime : 0.0;
        accident.setBudgetEstime(budget);
        accident.setCoutTotal(budget);

        String dossier = "accidents/" + UUID.randomUUID().toString();
        List<String> photoUrls = new ArrayList<>();
        if (photos != null && photos.length > 0) {
            for (int i = 0; i < photos.length; i++) {
                MultipartFile photo = photos[i];
                if (photo != null && !photo.isEmpty()) {
                    String url = fileStorageService.storeFile(photo, dossier, "photo_" + i + "_" + System.currentTimeMillis());
                    if (url != null) {
                        photoUrls.add(url);
                    }
                }
            }
        }
        accident.setPhotosUrl(photoUrls);

        Accident saved = accidentRepository.save(accident);
        syncDepense(saved);
        return saved;
    }

    private void syncDepense(Accident acc) {
        String sourceCustom = "Accident #" + acc.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(acc.getBudgetEstime());
        depense.setDateDepense(acc.getDateIntervention());

        String providerName = "Conducteur: " + (acc.getConducteur() != null && acc.getConducteur().getUtilisateur() != null
                ? acc.getConducteur().getUtilisateur().getNom() + " " + acc.getConducteur().getUtilisateur().getPrenom()
                : "Inconnu");

        depense.setQui(providerName);
        depense.setSourceDepense("Accident");
        depense.setSourceDepenseCustom(sourceCustom);
        if (depense.getId() == null) {
            depense.setEstPayee(false);
        }
        depense.setEntreprise(getCurrentEntreprise());

        depenseRepository.save(depense);
    }

    private String extractDossier(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            return "accidents/" + UUID.randomUUID().toString();
        }
        String[] parts = fileUrl.split("/");
        if (parts.length >= 3) {
            return "accidents/" + parts[2];
        }
        return "accidents/" + UUID.randomUUID().toString();
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
}
