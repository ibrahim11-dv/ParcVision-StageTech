package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.AccidentRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AccidentService {

    private final AccidentRepository accidentRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

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

    public Accident updateAccident(Long id, Map<String, Object> updates) {
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

    public void deleteAccident(Long id) {
        accidentRepository.deleteById(id);
    }

    public Accident saveAccident(Accident accident) {
        return accidentRepository.save(accident);
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
