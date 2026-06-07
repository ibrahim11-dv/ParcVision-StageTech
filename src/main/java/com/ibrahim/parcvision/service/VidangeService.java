package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VidangeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class VidangeService {

    private final VidangeRepository vidangeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final com.ibrahim.parcvision.repository.FournisseurRepository fournisseurRepository;
    private final com.ibrahim.parcvision.repository.DepenseRepository depenseRepository;

    public VidangeService(VidangeRepository vidangeRepository, 
                         UtilisateurRepository utilisateurRepository,
                         com.ibrahim.parcvision.repository.FournisseurRepository fournisseurRepository,
                         com.ibrahim.parcvision.repository.DepenseRepository depenseRepository) {
        this.vidangeRepository = vidangeRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.fournisseurRepository = fournisseurRepository;
        this.depenseRepository = depenseRepository;
    }

    public Page<Vidange> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        return vidangeRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }

    public Page<Vidange> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, org.springframework.data.domain.Sort.by("id").descending());
        return vidangeRepository.search(query, getCurrentEntreprise(), pageable);
    }

    public Vidange save(Vidange vidange) {
        Vidange saved = vidangeRepository.save(vidange);
        syncDepense(saved);
        return saved;
    }

    public Vidange update(Long id, Map<String, Object> updates) {
        Vidange vidange = vidangeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vidange non trouvée"));

        if (updates.containsKey("dateIntervention") && updates.get("dateIntervention") != null)
            vidange.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));

        if (updates.containsKey("fournisseurId")) {
            Object fId = updates.get("fournisseurId");
            if (fId != null && !fId.toString().isEmpty()) {
                vidange.setFournisseur(fournisseurRepository.findById(Long.parseLong(fId.toString())).orElse(null));
            } else {
                vidange.setFournisseur(null);
            }
        }

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

        Vidange updated = vidangeRepository.save(vidange);
        syncDepense(updated);
        return updated;
    }

    public void delete(Long id) {
        // Supprimer la dépense associée si elle existe
        String sourceCustom = "Vidange #" + id;
        depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .ifPresent(d -> depenseRepository.delete(d));

        vidangeRepository.deleteById(id);
    }

    private void syncDepense(Vidange vid) {
        String sourceCustom = "Vidange #" + vid.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(vid.getCoutTotal());
        depense.setDateDepense(vid.getDateIntervention());

        String providerName = "Garage Inconnu";
        if (vid.getFournisseur() != null) {
            if (vid.getFournisseur().getNomFournisseur() != null) {
                providerName = vid.getFournisseur().getNomFournisseur();
            } else {
                providerName = fournisseurRepository.findById(vid.getFournisseur().getIdFournisseur())
                        .map(f -> f.getNomFournisseur())
                        .orElse("Fournisseur Inconnu");
            }
        }

        depense.setQui(providerName);
        depense.setSourceDepense("Vidange");
        depense.setSourceDepenseCustom(sourceCustom);
        depense.setEstPayee(Boolean.TRUE.equals(vid.getEstPaye()));
        depense.setEntreprise(getCurrentEntreprise());

        depenseRepository.save(depense);
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
