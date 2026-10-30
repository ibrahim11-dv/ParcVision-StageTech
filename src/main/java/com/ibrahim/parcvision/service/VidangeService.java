package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.FournisseurRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import com.ibrahim.parcvision.repository.VidangeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VidangeService {

    private final VidangeRepository vidangeRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FournisseurRepository fournisseurRepository;
    private final DepenseRepository depenseRepository;
    private final VehiculeRepository vehiculeRepository;

    public VidangeService(VidangeRepository vidangeRepository,
                          UtilisateurRepository utilisateurRepository,
                          FournisseurRepository fournisseurRepository,
                          DepenseRepository depenseRepository,
                          VehiculeRepository vehiculeRepository) {
        this.vidangeRepository = vidangeRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.fournisseurRepository = fournisseurRepository;
        this.depenseRepository = depenseRepository;
        this.vehiculeRepository = vehiculeRepository;
    }

    public Page<Vidange> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return vidangeRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }

    public Page<Vidange> findByStatus(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        if (status == null || status.isBlank() || "Tous".equalsIgnoreCase(status)) {
            return vidangeRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
        }
        List<Vidange> all = vidangeRepository.findByVehiculeEntrepriseOrderByIdDesc(getCurrentEntreprise());
        List<Vidange> filtered = all.stream()
                .filter(v -> matchesStatus(v, status))
                .collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<Vidange> pageContent = start > filtered.size() ? List.of() : filtered.subList(start, end);
        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    public Map<String, Object> getStats() {
        List<Vidange> all = vidangeRepository.findByVehiculeEntrepriseOrderByIdDesc(getCurrentEntreprise());
        long ajour = 0;
        long bientot = 0;
        long retard = 0;
        for (Vidange v : all) {
            long remaining = computeRemainingKm(v);
            if (remaining <= 0) {
                retard++;
            } else if (remaining <= 2000) {
                bientot++;
            } else {
                ajour++;
            }
        }
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", all.size());
        stats.put("ajour", ajour);
        stats.put("bientot", bientot);
        stats.put("retard", retard);
        return stats;
    }

    private long computeRemainingKm(Vidange v) {
        long kmAtOilChange = v.getKilometrageAuMoment() != null ? v.getKilometrageAuMoment() : 0L;
        long currentKm = (v.getVehicule() != null && v.getVehicule().getKilometrageActuel() != null)
                ? v.getVehicule().getKilometrageActuel()
                : kmAtOilChange;
        long nextKm = kmAtOilChange + 10000L;
        return nextKm - currentKm;
    }

    private boolean matchesStatus(Vidange v, String statusFilter) {
        long remaining = computeRemainingKm(v);
        String computed;
        if (remaining <= 0) {
            computed = "En retard";
        } else if (remaining <= 2000) {
            computed = "Bientôt";
        } else {
            computed = "À jour";
        }
        String normFilter = statusFilter.trim().toLowerCase();
        if (normFilter.contains("retard")) return "En retard".equals(computed);
        if (normFilter.contains("bient")) return "Bientôt".equals(computed);
        if (normFilter.contains("jour")) return "À jour".equals(computed);
        return computed.equalsIgnoreCase(statusFilter.trim());
    }

    public Page<Vidange> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return vidangeRepository.search(query, getCurrentEntreprise(), pageable);
    }

    public Vidange save(Vidange vidange) {
        if (vidange.getVehicule() != null && vidange.getVehicule().getId() != null) {
            vehiculeRepository.findById(vidange.getVehicule().getId()).ifPresent(vidange::setVehicule);
        }
        if (vidange.getFournisseur() != null && vidange.getFournisseur().getIdFournisseur() != null) {
            fournisseurRepository.findById(vidange.getFournisseur().getIdFournisseur()).ifPresent(vidange::setFournisseur);
        }
        Vidange saved = vidangeRepository.save(vidange);
        syncDepense(saved);
        return saved;
    }

    public Vidange update(Long id, Map<String, Object> updates) {
        Vidange vidange = vidangeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vidange non trouvée"));

        if (updates.containsKey("vehiculeId") && updates.get("vehiculeId") != null && !updates.get("vehiculeId").toString().isEmpty()) {
            Long vId = Long.parseLong(updates.get("vehiculeId").toString());
            Vehicule veh = vehiculeRepository.findById(vId)
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
            vidange.setVehicule(veh);
        } else if (updates.containsKey("vehicule") && updates.get("vehicule") instanceof Map<?, ?> vehMap) {
            Object vIdObj = vehMap.get("id");
            if (vIdObj != null && !vIdObj.toString().isEmpty()) {
                Long vId = Long.parseLong(vIdObj.toString());
                vehiculeRepository.findById(vId).ifPresent(vidange::setVehicule);
            }
        }

        if (updates.containsKey("dateIntervention") && updates.get("dateIntervention") != null && !updates.get("dateIntervention").toString().isEmpty()) {
            vidange.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));
        }

        if (updates.containsKey("fournisseurId")) {
            Object fId = updates.get("fournisseurId");
            if (fId != null && !fId.toString().isEmpty()) {
                vidange.setFournisseur(fournisseurRepository.findById(Long.parseLong(fId.toString())).orElse(null));
            } else {
                vidange.setFournisseur(null);
            }
        } else if (updates.containsKey("fournisseur") && updates.get("fournisseur") instanceof Map<?, ?> fMap) {
            Object fIdObj = fMap.get("idFournisseur") != null ? fMap.get("idFournisseur") : fMap.get("id");
            if (fIdObj != null && !fIdObj.toString().isEmpty()) {
                vidange.setFournisseur(fournisseurRepository.findById(Long.parseLong(fIdObj.toString())).orElse(null));
            }
        }

        if (updates.containsKey("descriptionPanne"))
            vidange.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("coutTotal") && updates.get("coutTotal") != null)
            vidange.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));
        if (updates.containsKey("typeHuile"))
            vidange.setTypeHuile((String) updates.get("typeHuile"));
        if (updates.containsKey("viscosite"))
            vidange.setViscosite((String) updates.get("viscosite"));
        if (updates.containsKey("kilometrageAuMoment") && updates.get("kilometrageAuMoment") != null)
            vidange.setKilometrageAuMoment(Long.parseLong(updates.get("kilometrageAuMoment").toString()));
        if (updates.containsKey("actionsMenees"))
            vidange.setActionsMenees((String) updates.get("actionsMenees"));

        if (updates.containsKey("filterHuileChange") && updates.get("filterHuileChange") != null)
            vidange.setFilterHuileChange(Boolean.parseBoolean(updates.get("filterHuileChange").toString()));
        if (updates.containsKey("filterAirChange") && updates.get("filterAirChange") != null)
            vidange.setFilterAirChange(Boolean.parseBoolean(updates.get("filterAirChange").toString()));
        if (updates.containsKey("filterCarburantChange") && updates.get("filterCarburantChange") != null)
            vidange.setFilterCarburantChange(Boolean.parseBoolean(updates.get("filterCarburantChange").toString()));

        if (updates.containsKey("estPaye") && updates.get("estPaye") != null) {
            vidange.setEstPaye(Boolean.parseBoolean(updates.get("estPaye").toString()));
        }
        if (updates.containsKey("datePayement")) {
            Object dp = updates.get("datePayement");
            if (dp == null || dp.toString().isEmpty()) {
                vidange.setDatePayement(null);
            } else {
                vidange.setDatePayement(LocalDate.parse(dp.toString()));
            }
        }

        Vidange updated = vidangeRepository.save(vidange);
        syncDepense(updated);
        return updated;
    }

    public void delete(Long id) {
        String sourceCustom = "Vidange #" + id;
        depenseRepository.findAllBySourceDepenseCustom(sourceCustom)
                .forEach(depenseRepository::delete);

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
            } else if (vid.getFournisseur().getIdFournisseur() != null) {
                providerName = fournisseurRepository.findById(vid.getFournisseur().getIdFournisseur())
                        .map(f -> f.getNomFournisseur())
                        .orElse("Fournisseur Inconnu");
            }
        }

        depense.setQui(providerName);
        depense.setSourceDepense("Vidange");
        depense.setSourceDepenseCustom(sourceCustom);
        if (vid.getEstPaye() != null) {
            depense.setEstPayee(vid.getEstPaye());
        } else if (depense.getId() == null) {
            depense.setEstPayee(false);
        }
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
