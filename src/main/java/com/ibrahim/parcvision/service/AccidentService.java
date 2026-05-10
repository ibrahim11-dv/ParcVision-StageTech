package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.repository.AccidentRepository;
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

    public List<Accident> Search(String query){
        return accidentRepository.searchByConducteurNom(query);
    }

    public List<Accident> findByetat(String etat){
        return accidentRepository.findByEtat(etat);
    }

    public List<Accident> AffichAll(){
        return accidentRepository.findAll();
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
