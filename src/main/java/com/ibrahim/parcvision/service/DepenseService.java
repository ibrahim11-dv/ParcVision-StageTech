package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Depense;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.AssuranceRepository;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.InfractionRepository;
import com.ibrahim.parcvision.repository.ReparationRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VidangeRepository;
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
    private final ReparationRepository reparationRepository;
    private final VidangeRepository vidangeRepository;
    private final AssuranceRepository assuranceRepository;
    private final InfractionRepository infractionRepository;

    public DepenseService(DepenseRepository depenseRepository,
                          UtilisateurRepository utilisateurRepository,
                          ReparationRepository reparationRepository,
                          VidangeRepository vidangeRepository,
                          AssuranceRepository assuranceRepository,
                          InfractionRepository infractionRepository) {
        this.depenseRepository = depenseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.reparationRepository = reparationRepository;
        this.vidangeRepository = vidangeRepository;
        this.assuranceRepository = assuranceRepository;
        this.infractionRepository = infractionRepository;
    }

    public Page<Depense> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return depenseRepository.findByEntreprise(getCurrentEntreprise(), pageable);
    }

    public Page<Depense> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
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
            if (updates.get("typePaiement") != null && !updates.get("typePaiement").toString().isBlank()) {
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
        if (updates.containsKey("dateDepense") && updates.get("dateDepense") != null && !updates.get("dateDepense").toString().isBlank())
            depense.setDateDepense(LocalDate.parse(updates.get("dateDepense").toString()));

        Depense saved = depenseRepository.save(depense);
        syncBackToSourceEntity(saved);
        return saved;
    }

    private void syncBackToSourceEntity(Depense depense) {
        String custom = depense.getSourceDepenseCustom();
        if (custom == null || !custom.contains("#")) {
            return;
        }
        try {
            String[] parts = custom.split("#", 2);
            String prefix = parts[0].trim();
            Long sourceId = Long.parseLong(parts[1].trim());
            boolean paid = depense.isEstPayee();
            LocalDate paymentDate = paid ? (depense.getDateDepense() != null ? depense.getDateDepense() : LocalDate.now()) : null;

            if ("Reparation".equalsIgnoreCase(prefix) || "Réparation".equalsIgnoreCase(prefix)) {
                reparationRepository.findById(sourceId).ifPresent(rep -> {
                    rep.setEstPaye(paid);
                    rep.setDatePayement(paymentDate);
                    reparationRepository.save(rep);
                });
            } else if ("Vidange".equalsIgnoreCase(prefix)) {
                vidangeRepository.findById(sourceId).ifPresent(vid -> {
                    vid.setEstPaye(paid);
                    vid.setDatePayement(paymentDate);
                    vidangeRepository.save(vid);
                });
            } else if ("Assurance".equalsIgnoreCase(prefix)) {
                assuranceRepository.findById(sourceId).ifPresent(ass -> {
                    ass.setEstPayee(paid);
                    ass.setDatePaiement(paymentDate);
                    assuranceRepository.save(ass);
                });
            } else if ("Infraction".equalsIgnoreCase(prefix)) {
                infractionRepository.findById(sourceId).ifPresent(inf -> {
                    inf.setEstPayee(paid);
                    inf.setDatePaiement(paymentDate);
                    infractionRepository.save(inf);
                });
            }
        } catch (Exception ignored) {
        }
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
