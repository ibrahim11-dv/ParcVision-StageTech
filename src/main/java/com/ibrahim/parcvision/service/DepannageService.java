package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.DepannageRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DepannageService {

    private final DepannageRepository depannageRepository;
    private final UtilisateurRepository utilisateurRepository;

    public DepannageService(DepannageRepository depannageRepository, UtilisateurRepository utilisateurRepository) {
        this.depannageRepository = depannageRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public Page<Depannage> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }

    public Page<Depannage> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.search(query, getCurrentEntreprise(), pageable);
    }

    public Page<Depannage> findByStatut(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.findByStatut(statut, getCurrentEntreprise(), pageable);
    }

    public Depannage save(Depannage depannage) {
        return depannageRepository.save(depannage);
    }

    public void delete(Long id) {
        depannageRepository.deleteById(id);
    }

    public Depannage update(Long id, Map<String, Object> updates) {
        Depannage depannage = depannageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépannage non trouvé"));

        if (updates.containsKey("statut")) depannage.setStatut((String) updates.get("statut"));
        if (updates.containsKey("lieuPanne")) depannage.setLieuPanne((String) updates.get("lieuPanne"));
        if (updates.containsKey("descriptionPanne")) depannage.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("coutTotal")) depannage.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));

        return depannageRepository.save(depannage);
    }

    public long countTotal() { return depannageRepository.countTotal(getCurrentEntreprise()); }
    public long countEnCours() { return depannageRepository.countEnCours(getCurrentEntreprise()); }
    public double sumFrais() {
        Double sum = depannageRepository.sumFrais(getCurrentEntreprise());
        return sum != null ? sum : 0.0;
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
