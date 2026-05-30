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
    private final com.ibrahim.parcvision.repository.DepenseRepository depenseRepository;
    private final com.ibrahim.parcvision.repository.FournisseurRepository fournisseurRepository;

    public DepannageService(DepannageRepository depannageRepository, 
                            UtilisateurRepository utilisateurRepository,
                            com.ibrahim.parcvision.repository.DepenseRepository depenseRepository,
                            com.ibrahim.parcvision.repository.FournisseurRepository fournisseurRepository) {
        this.depannageRepository = depannageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.depenseRepository = depenseRepository;
        this.fournisseurRepository = fournisseurRepository;
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
        Depannage saved = depannageRepository.save(depannage);
        syncDepense(saved);
        return saved;
    }

    public void delete(Long id) {
        String sourceCustom = "Dépannage #" + id;
        depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .ifPresent(d -> depenseRepository.delete(d));
        depannageRepository.deleteById(id);
    }

    public Depannage update(Long id, Map<String, Object> updates) {
        Depannage depannage = depannageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépannage non trouvé"));

        if (updates.containsKey("statut")) depannage.setStatut((String) updates.get("statut"));
        if (updates.containsKey("lieuPanne")) depannage.setLieuPanne((String) updates.get("lieuPanne"));
        if (updates.containsKey("descriptionPanne")) depannage.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("coutTotal")) depannage.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));

        Depannage updated = depannageRepository.save(depannage);
        syncDepense(updated);
        return updated;
    }

    private void syncDepense(Depannage dep) {
        String sourceCustom = "Dépannage #" + dep.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(dep.getCoutTotal());
        depense.setDateDepense(dep.getDateIntervention());
        
        String providerName = "Dépanneur Inconnu";
        if (dep.getFournisseur() != null) {
            if (dep.getFournisseur().getNomFournisseur() != null) {
                providerName = dep.getFournisseur().getNomFournisseur();
            } else {
                providerName = fournisseurRepository.findById(dep.getFournisseur().getIdFournisseur())
                        .map(f -> f.getNomFournisseur())
                        .orElse("Fournisseur Inconnu");
            }
        } else if (dep.getNomDepanneurExterne() != null && !dep.getNomDepanneurExterne().isEmpty()) {
            providerName = dep.getNomDepanneurExterne();
        }
        
        depense.setQui(providerName);
        depense.setSourceDepense("Dépannage");
        depense.setSourceDepenseCustom(sourceCustom);
        depense.setTypePaiement(com.ibrahim.parcvision.enums.TypePaiement.EN_ATTENTE);
        depense.setEntreprise(getCurrentEntreprise());

        depenseRepository.save(depense);
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
