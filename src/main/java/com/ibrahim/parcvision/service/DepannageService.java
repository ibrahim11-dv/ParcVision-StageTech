package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Fournisseur;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.repository.DepannageRepository;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.FournisseurRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class DepannageService {

    private final DepannageRepository depannageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final DepenseRepository depenseRepository;
    private final FournisseurRepository fournisseurRepository;
    private final VehiculeRepository vehiculeRepository;

    public DepannageService(DepannageRepository depannageRepository,
                            UtilisateurRepository utilisateurRepository,
                            DepenseRepository depenseRepository,
                            FournisseurRepository fournisseurRepository,
                            VehiculeRepository vehiculeRepository) {
        this.depannageRepository = depannageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.depenseRepository = depenseRepository;
        this.fournisseurRepository = fournisseurRepository;
        this.vehiculeRepository = vehiculeRepository;
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
        if (depannage.getVehicule() != null && depannage.getVehicule().getId() != null) {
            vehiculeRepository.findById(depannage.getVehicule().getId()).ifPresent(depannage::setVehicule);
        }
        if (depannage.getFournisseur() != null && depannage.getFournisseur().getIdFournisseur() != null) {
            Fournisseur f = fournisseurRepository.findById(depannage.getFournisseur().getIdFournisseur()).orElse(null);
            depannage.setFournisseur(f);
            if (f != null && (depannage.getNomDepanneurExterne() == null || depannage.getNomDepanneurExterne().isBlank())) {
                depannage.setNomDepanneurExterne(f.getNomFournisseur());
            }
        }
        Depannage saved = depannageRepository.save(depannage);
        syncDepense(saved);
        return saved;
    }

    public void delete(Long id) {
        String sourceCustom = "Dépannage #" + id;
        depenseRepository.findAllBySourceDepenseCustom(sourceCustom)
                .forEach(depenseRepository::delete);
        depenseRepository.findAllBySourceDepenseCustom("Depannage #" + id)
                .forEach(depenseRepository::delete);
        depannageRepository.deleteById(id);
    }

    public Depannage update(Long id, Map<String, Object> updates) {
        Depannage depannage = depannageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépannage non trouvé"));

        if (updates.containsKey("vehiculeId") && updates.get("vehiculeId") != null && !updates.get("vehiculeId").toString().isEmpty()) {
            Long vId = Long.parseLong(updates.get("vehiculeId").toString());
            Vehicule veh = vehiculeRepository.findById(vId)
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
            depannage.setVehicule(veh);
        } else if (updates.containsKey("vehicule") && updates.get("vehicule") instanceof Map<?, ?> vehMap) {
            Object vIdObj = vehMap.get("id");
            if (vIdObj != null && !vIdObj.toString().isEmpty()) {
                Long vId = Long.parseLong(vIdObj.toString());
                vehiculeRepository.findById(vId).ifPresent(depannage::setVehicule);
            }
        }

        if (updates.containsKey("dateIntervention") && updates.get("dateIntervention") != null && !updates.get("dateIntervention").toString().isEmpty()) {
            depannage.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));
        }
        if (updates.containsKey("statut"))
            depannage.setStatut((String) updates.get("statut"));
        if (updates.containsKey("lieuPanne"))
            depannage.setLieuPanne((String) updates.get("lieuPanne"));
        if (updates.containsKey("descriptionPanne"))
            depannage.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("actionsMenees"))
            depannage.setActionsMenees((String) updates.get("actionsMenees"));
        if (updates.containsKey("coutTotal") && updates.get("coutTotal") != null)
            depannage.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));
        if (updates.containsKey("kilometrageAuMoment") && updates.get("kilometrageAuMoment") != null)
            depannage.setKilometrageAuMoment(Long.parseLong(updates.get("kilometrageAuMoment").toString()));
        if (updates.containsKey("necessiteRemorquage") && updates.get("necessiteRemorquage") != null)
            depannage.setNecessiteRemorquage(Boolean.parseBoolean(updates.get("necessiteRemorquage").toString()));
        if (updates.containsKey("nomDepanneurExterne"))
            depannage.setNomDepanneurExterne((String) updates.get("nomDepanneurExterne"));

        if (updates.containsKey("fournisseurId")) {
            Object fId = updates.get("fournisseurId");
            if (fId != null && !fId.toString().isEmpty()) {
                Fournisseur f = fournisseurRepository.findById(Long.parseLong(fId.toString())).orElse(null);
                depannage.setFournisseur(f);
                if (f != null && (depannage.getNomDepanneurExterne() == null || depannage.getNomDepanneurExterne().isBlank())) {
                    depannage.setNomDepanneurExterne(f.getNomFournisseur());
                }
            } else {
                depannage.setFournisseur(null);
            }
        } else if (updates.containsKey("fournisseur") && updates.get("fournisseur") instanceof Map<?, ?> fMap) {
            Object fIdObj = fMap.get("idFournisseur") != null ? fMap.get("idFournisseur") : fMap.get("id");
            if (fIdObj != null && !fIdObj.toString().isEmpty()) {
                Fournisseur f = fournisseurRepository.findById(Long.parseLong(fIdObj.toString())).orElse(null);
                depannage.setFournisseur(f);
                if (f != null && (depannage.getNomDepanneurExterne() == null || depannage.getNomDepanneurExterne().isBlank())) {
                    depannage.setNomDepanneurExterne(f.getNomFournisseur());
                }
            }
        }

        Depannage updated = depannageRepository.save(depannage);
        syncDepense(updated);
        return updated;
    }

    private void syncDepense(Depannage dep) {
        String sourceCustom = "Dépannage #" + dep.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElseGet(() -> depenseRepository.findBySourceDepenseCustom("Depannage #" + dep.getId())
                        .orElse(new com.ibrahim.parcvision.entity.Depense()));

        depense.setMontant(dep.getCoutTotal());
        depense.setDateDepense(dep.getDateIntervention());

        String providerName = "Dépanneur Inconnu";
        if (dep.getFournisseur() != null) {
            if (dep.getFournisseur().getNomFournisseur() != null) {
                providerName = dep.getFournisseur().getNomFournisseur();
            } else if (dep.getFournisseur().getIdFournisseur() != null) {
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
        if (depense.getId() == null) {
            depense.setEstPayee(false);
        }
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
