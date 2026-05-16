package com.ibrahim.parcvision.service;


import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Reparation;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.ReparationRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class ReparationService {

    @Autowired
    private ReparationRepository reparationRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public ReparationService(ReparationRepository reparationRepository) {
        this.reparationRepository = reparationRepository;
    }

    public long countReparation() {
        return reparationRepository.countByVehiculeEntreprise(getCurrentEntreprise());
    }

    public long countByEtat(String etat) {
        return reparationRepository.countByStatutAndVehiculeEntreprise(etat, getCurrentEntreprise());
    }

    public double BudgetTotal() {
        Double result = reparationRepository.SumBudget(getCurrentEntreprise());
        return result != null ? result : 0.0;
    }

    //Search
    public Page<Reparation> search(String immat, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.search(immat, getCurrentEntreprise(), pageable);
    }

    //Afficher d apres les statut !
    public Page<Reparation> findByStatut(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findByStatutAndVehiculeEntreprise(statut, getCurrentEntreprise(), pageable);
    }

    //Affichage la Liste des reparations !
    public Page<Reparation> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }


    //button supp
    public void Delete(long id) {
        reparationRepository.deleteById(id);
    }

    //Pour button d affichage des informations ne necessite pas une method dans service
    //button modifier:
    public Reparation updateReparation(Long id, Map<String, Object> updates) {
        Reparation reparation = reparationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réparation non trouvée"));

        if (updates.containsKey("garagePrestataire"))
            reparation.setGaragePrestataire((String) updates.get("garagePrestataire"));

        if (updates.containsKey("dateIntervention"))
            reparation.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));

        if (updates.containsKey("descriptionPanne"))
            reparation.setDescriptionPanne((String) updates.get("descriptionPanne"));

        if (updates.containsKey("coutTotal"))
            reparation.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));

        if (updates.containsKey("statut"))
            reparation.setStatut((String) updates.get("statut"));

        return reparationRepository.save(reparation);
    }

    //Ajouter une reparation :
    public Reparation saveReparation(Reparation reparation) {
        return reparationRepository.save(reparation);
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
