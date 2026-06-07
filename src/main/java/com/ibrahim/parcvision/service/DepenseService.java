package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Depense;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class DepenseService {

    private final DepenseRepository depenseRepository;
    private final UtilisateurRepository utilisateurRepository;

    public DepenseService(DepenseRepository depenseRepository,
                          UtilisateurRepository utilisateurRepository) {
        this.depenseRepository = depenseRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public Page<Depense> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return depenseRepository.findByEntreprise(getCurrentEntreprise(), pageable);
    }

    public Page<Depense> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        System.out.println("Executing Search: query='" + query + "', enterprise=" + getCurrentEntreprise().getNom());
        return depenseRepository.search(query, getCurrentEntreprise(), pageable);
    }

    public Depense save(Depense depense) {
        depense.setEntreprise(getCurrentEntreprise());
        return depenseRepository.save(depense);
    }

    public Depense update(Long id, Map<String, Object> updates) {
        Depense depense = depenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépense non trouvée"));

        if (updates.containsKey("typePaiement")) {
            if (updates.get("typePaiement") != null) {
                depense.setTypePaiement(com.ibrahim.parcvision.enums.TypePaiement.valueOf(updates.get("typePaiement").toString()));
            } else {
                depense.setTypePaiement(null);
            }
        }
        if (updates.containsKey("estPayee") && updates.get("estPayee") != null) {
            depense.setEstPayee(Boolean.parseBoolean(updates.get("estPayee").toString()));
        }
        if (updates.containsKey("qui"))
            depense.setQui((String) updates.get("qui"));
        if (updates.containsKey("montant") && updates.get("montant") != null)
            depense.setMontant(Double.parseDouble(updates.get("montant").toString()));
        if (updates.containsKey("sourceDepense"))
            depense.setSourceDepense((String) updates.get("sourceDepense"));
        if (updates.containsKey("sourceDepenseCustom"))
            depense.setSourceDepenseCustom((String) updates.get("sourceDepenseCustom"));
        if (updates.containsKey("dateDepense") && updates.get("dateDepense") != null)
            depense.setDateDepense(LocalDate.parse(updates.get("dateDepense").toString()));

        return depenseRepository.save(depense);
    }

    public void delete(Long id) {
        depenseRepository.deleteById(id);
    }

    public long count() {
        return depenseRepository.countByEntreprise(getCurrentEntreprise());
    }

    public Double totalMontant() {
        return depenseRepository.sumMontantByEntreprise(getCurrentEntreprise());
    }

    public long countCarte() {
        return depenseRepository.countByEntrepriseAndTypePaiementCarte(getCurrentEntreprise());
    }

    public long countEspeces() {
        return depenseRepository.countByEntrepriseAndTypePaiementEspeces(getCurrentEntreprise());
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
