package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.repository.AccidentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AccidentService {

    private AccidentRepository accidentRepository;
    public  AccidentService(AccidentRepository accidentRepository) {
        this.accidentRepository = accidentRepository;
    }

    public long countAccident(){
        return accidentRepository.count();
    }

    public long getNombreEnReparation() {
        return accidentRepository.countByEtat("En réparation");
    }

    public double getTotalBudget(){
        Double result = accidentRepository.sumBudgetEstime();
        return result != null ? result : 0.0;
    }

    public Page<Accident> Search(String query, int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.searchByConducteurNom(query, pageable);
    }

    public Page<Accident> findByetat(String etat, int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.findByEtat(etat, pageable);
    }

    public Page<Accident> AffichAll(int page, int size){
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return accidentRepository.findAll(pageable);
    }

    public Accident updateAccident(Long id, Map<String, Object> updates){
        Accident accident = accidentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Accident non trouvé"));

        if (updates.containsKey("etat"))
            accident.setEtat((String) updates.get("etat"));

        if (updates.containsKey("budgetEstime"))
            accident.setBudgetEstime(Double.parseDouble(updates.get("budgetEstime").toString()));

        if (updates.containsKey("notes"))
            accident.setNotes((String) updates.get("notes"));

        return accidentRepository.save(accident);
    }

    public Accident saveAccident(Accident accident){
        return accidentRepository.save(accident) ;
    }
}
