package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VidangeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class VidangeService {

    private final VidangeRepository vidangeRepository;
    private final UtilisateurRepository utilisateurRepository;

    public VidangeService(VidangeRepository vidangeRepository, UtilisateurRepository utilisateurRepository) {
        this.vidangeRepository = vidangeRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Vidange> findAll() {
        return vidangeRepository.findByVehiculeEntreprise(getCurrentEntreprise());
    }

    public List<Vidange> search(String query) {
        return vidangeRepository.search(query, getCurrentEntreprise());
    }

    public Vidange save(Vidange vidange) {
        return vidangeRepository.save(vidange);
    }

    public Vidange update(Long id, Map<String, Object> updates) {
        Vidange vidange = vidangeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vidange non trouvée"));

        if (updates.containsKey("dateIntervention") && updates.get("dateIntervention") != null)
            vidange.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));
        if (updates.containsKey("descriptionPanne"))
            vidange.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("coutTotal") && updates.get("coutTotal") != null)
            vidange.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));
        if (updates.containsKey("typeHuile"))
            vidange.setTypeHuile((String) updates.get("typeHuile"));
        if (updates.containsKey("kilometrageAuMoment") && updates.get("kilometrageAuMoment") != null)
            vidange.setKilometrageAuMoment(Long.parseLong(updates.get("kilometrageAuMoment").toString()));
        if (updates.containsKey("actionsMenees"))
            vidange.setActionsMenees((String) updates.get("actionsMenees"));

        return vidangeRepository.save(vidange);
    }

    public void delete(Long id) {
        vidangeRepository.deleteById(id);
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
