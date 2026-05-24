package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Fournisseur;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.FournisseurRepository;
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
public class FournisseurService {

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    public FournisseurService(FournisseurRepository fournisseurRepository) {
        this.fournisseurRepository = fournisseurRepository;
    }

    public long countFournisseur() {
        return fournisseurRepository.countByEntreprise(getCurrentEntreprise());
    }

    public long countByType(String type) {
        return fournisseurRepository.countByTypeFournisseurAndEntreprise(type, getCurrentEntreprise());
    }

    public Page<Fournisseur> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nomFournisseur").ascending());
        return fournisseurRepository.findByEntreprise(getCurrentEntreprise(), pageable);
    }

    public java.util.List<Fournisseur> findAllList() {
        return fournisseurRepository.findByEntreprise(getCurrentEntreprise());
    }

    public Page<Fournisseur> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("nomFournisseur").ascending());
        return fournisseurRepository.search(query, getCurrentEntreprise(), pageable);
    }

    public Fournisseur saveFournisseur(Fournisseur fournisseur) {
        fournisseur.setEntreprise(getCurrentEntreprise());
        return fournisseurRepository.save(fournisseur);
    }

    public Fournisseur updateFournisseur(Long id, Map<String, Object> updates) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));

        // Vérifier que le fournisseur appartient à la même entreprise
        if (!fournisseur.getEntreprise().getId().equals(getCurrentEntreprise().getId())) {
            throw new RuntimeException("Accès non autorisé à ce fournisseur");
        }

        if (updates.containsKey("typeFournisseur")) {
            fournisseur.setTypeFournisseur((String) updates.get("typeFournisseur"));
        }
        if (updates.containsKey("nomFournisseur")) {
            fournisseur.setNomFournisseur((String) updates.get("nomFournisseur"));
        }
        if (updates.containsKey("ville")) {
            fournisseur.setVille((String) updates.get("ville"));
        }
        if (updates.containsKey("adresse")) {
            fournisseur.setAdresse((String) updates.get("adresse"));
        }
        if (updates.containsKey("telephone")) {
            fournisseur.setTelephone((String) updates.get("telephone"));
        }

        return fournisseurRepository.save(fournisseur);
    }

    public void Delete(long id) {
        Fournisseur fournisseur = fournisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));

        if (!fournisseur.getEntreprise().getId().equals(getCurrentEntreprise().getId())) {
            throw new RuntimeException("Accès non autorisé à ce fournisseur");
        }

        fournisseurRepository.deleteById(id);
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
