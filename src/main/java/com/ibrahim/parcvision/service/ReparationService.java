package com.ibrahim.parcvision.service;


import com.ibrahim.parcvision.controller.ReparationController;
import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Reparation;
import com.ibrahim.parcvision.repository.AccidentRepository;
import com.ibrahim.parcvision.repository.ReparationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class ReparationService {

    @Autowired
    private ReparationRepository reparationRepository;
    public  ReparationService(ReparationRepository reparationRepository) {
        this.reparationRepository = reparationRepository;
    }

    public long countReparation(){
        return reparationRepository.count();
    }

    public long countByEtat(String etat){
        return reparationRepository.countByStatut(etat);
    }

    public double BudgetTotal(){
        Double result = reparationRepository.SumBudget();
        return result != null ? result : 0.0;
    }

    //Serach
    public Page<Reparation> search(String immat, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.search(immat, pageable);
    }
    //Afficher d apres les statut !
    public Page<Reparation> findByStatut(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findByStatut(statut, pageable);
    }
    //Affichage la Liste des reparations !
    public Page<Reparation> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findAll(pageable);
    }


    //button supp
    public void Delete(long id){
         reparationRepository.deleteById(id);
    }

    //Pour button d affichage des informations ne necessite pas une method dans service
    //button modifier:
    public Reparation updateReparation(Long id, Map<String, Object> updates){
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
    public Reparation saveReparation(Reparation reparation){
        return reparationRepository.save(reparation);
    }

}
