package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Fournisseur;
import com.ibrahim.parcvision.entity.Reparation;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.FournisseurRepository;
import com.ibrahim.parcvision.repository.ReparationRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Map;

@Service
public class ReparationService {

    @Autowired
    private ReparationRepository reparationRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private DepenseService depenseService;

    @Autowired
    private DepenseRepository depenseRepository;

    @Autowired
    private VehiculeRepository vehiculeRepository;

    public ReparationService(ReparationRepository reparationRepository) {
        this.reparationRepository = reparationRepository;
    }

    public long countReparation() {
        return reparationRepository.countByVehiculeEntreprise(getCurrentEntreprise());
    }

    public long countByEtat(String etat) {
        return reparationRepository.countByStatutAndVehiculeEntreprise(etat, getCurrentEntreprise());
    }

    public double BudgetTotal() {
        Double result = reparationRepository.SumBudget(getCurrentEntreprise());
        return result != null ? result : 0.0;
    }

    // Search
    public Page<Reparation> search(String immat, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.search(immat, getCurrentEntreprise(), pageable);
    }

    // Afficher d apres les statut !
    public Page<Reparation> findByStatut(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findByStatutAndVehiculeEntreprise(statut, getCurrentEntreprise(), pageable);
    }

    // Affichage la Liste des reparations !
    public Page<Reparation> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return reparationRepository.findByVehiculeEntreprise(getCurrentEntreprise(), pageable);
    }

    // button supp
    public void Delete(long id) {
        String sourceCustom = "Reparation #" + id;
        depenseRepository.findAllBySourceDepenseCustom(sourceCustom)
                .forEach(depenseRepository::delete);

        reparationRepository.deleteById(id);
    }

    public Reparation update(Long id, Map<String, Object> updates) {
        return updateReparation(id, updates);
    }

    // button modifier:
    public Reparation updateReparation(Long id, Map<String, Object> updates) {
        Reparation reparation = reparationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réparation non trouvée"));

        if (updates.containsKey("vehiculeId") && updates.get("vehiculeId") != null && !updates.get("vehiculeId").toString().isEmpty()) {
            Long vId = Long.parseLong(updates.get("vehiculeId").toString());
            Vehicule veh = vehiculeRepository.findById(vId)
                    .orElseThrow(() -> new RuntimeException("Véhicule non trouvé"));
            reparation.setVehicule(veh);
        } else if (updates.containsKey("vehicule") && updates.get("vehicule") instanceof Map<?, ?> vehMap) {
            Object vIdObj = vehMap.get("id");
            if (vIdObj != null && !vIdObj.toString().isEmpty()) {
                Long vId = Long.parseLong(vIdObj.toString());
                vehiculeRepository.findById(vId).ifPresent(reparation::setVehicule);
            }
        }

        if (updates.containsKey("garagePrestataire"))
            reparation.setGaragePrestataire((String) updates.get("garagePrestataire"));

        if (updates.containsKey("fournisseurId")) {
            Object fId = updates.get("fournisseurId");
            if (fId != null && !fId.toString().isEmpty()) {
                Fournisseur f = fournisseurRepository.findById(Long.parseLong(fId.toString())).orElse(null);
                reparation.setFournisseur(f);
                if (f != null && (reparation.getGaragePrestataire() == null || reparation.getGaragePrestataire().isBlank())) {
                    reparation.setGaragePrestataire(f.getNomFournisseur());
                }
            } else {
                reparation.setFournisseur(null);
            }
        } else if (updates.containsKey("fournisseur") && updates.get("fournisseur") instanceof Map<?, ?> fMap) {
            Object fIdObj = fMap.get("idFournisseur") != null ? fMap.get("idFournisseur") : fMap.get("id");
            if (fIdObj != null && !fIdObj.toString().isEmpty()) {
                Fournisseur f = fournisseurRepository.findById(Long.parseLong(fIdObj.toString())).orElse(null);
                reparation.setFournisseur(f);
                if (f != null && (reparation.getGaragePrestataire() == null || reparation.getGaragePrestataire().isBlank())) {
                    reparation.setGaragePrestataire(f.getNomFournisseur());
                }
            }
        }

        if (updates.containsKey("dateIntervention") && updates.get("dateIntervention") != null && !updates.get("dateIntervention").toString().isEmpty())
            reparation.setDateIntervention(LocalDate.parse(updates.get("dateIntervention").toString()));

        if (updates.containsKey("descriptionPanne"))
            reparation.setDescriptionPanne((String) updates.get("descriptionPanne"));

        if (updates.containsKey("piecesRemplacees"))
            reparation.setPiecesRemplacees((String) updates.get("piecesRemplacees"));

        if (updates.containsKey("actionsMenees"))
            reparation.setActionsMenees((String) updates.get("actionsMenees"));

        if (updates.containsKey("kilometrageAuMoment") && updates.get("kilometrageAuMoment") != null)
            reparation.setKilometrageAuMoment(Long.parseLong(updates.get("kilometrageAuMoment").toString()));

        if (updates.containsKey("coutTotal") && updates.get("coutTotal") != null)
            reparation.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));

        if (updates.containsKey("statut"))
            reparation.setStatut((String) updates.get("statut"));

        if (updates.containsKey("estPaye") && updates.get("estPaye") != null) {
            Object val = updates.get("estPaye");
            if (val instanceof Boolean) {
                reparation.setEstPaye((Boolean) val);
            } else {
                reparation.setEstPaye(Boolean.parseBoolean(val.toString()));
            }
        }

        if (updates.containsKey("datePayement")) {
            Object val = updates.get("datePayement");
            if (val == null || val.toString().isEmpty()) {
                reparation.setDatePayement(null);
            } else {
                reparation.setDatePayement(LocalDate.parse(val.toString()));
            }
        }

        Reparation updated = reparationRepository.save(reparation);
        syncDepense(updated);
        return updated;
    }

    // Ajouter une reparation :
    public Reparation saveReparation(Reparation reparation) {
        if (reparation.getVehicule() != null && reparation.getVehicule().getId() != null) {
            vehiculeRepository.findById(reparation.getVehicule().getId()).ifPresent(reparation::setVehicule);
        }
        if (reparation.getFournisseur() != null && reparation.getFournisseur().getIdFournisseur() != null) {
            Fournisseur f = fournisseurRepository.findById(reparation.getFournisseur().getIdFournisseur()).orElse(null);
            reparation.setFournisseur(f);
            if (f != null && (reparation.getGaragePrestataire() == null || reparation.getGaragePrestataire().isBlank())) {
                reparation.setGaragePrestataire(f.getNomFournisseur());
            }
        }
        Reparation saved = reparationRepository.save(reparation);
        syncDepense(saved);
        return saved;
    }

    private void syncDepense(Reparation rep) {
        String sourceCustom = "Reparation #" + rep.getId();
        com.ibrahim.parcvision.entity.Depense depense = depenseRepository.findBySourceDepenseCustom(sourceCustom)
                .orElse(new com.ibrahim.parcvision.entity.Depense());

        depense.setMontant(rep.getCoutTotal());
        depense.setDateDepense(rep.getDateIntervention());

        String providerName = "Garage Inconnu";
        if (rep.getFournisseur() != null) {
            if (rep.getFournisseur().getNomFournisseur() != null) {
                providerName = rep.getFournisseur().getNomFournisseur();
            } else if (rep.getFournisseur().getIdFournisseur() != null) {
                providerName = fournisseurRepository.findById(rep.getFournisseur().getIdFournisseur())
                        .map(f -> f.getNomFournisseur())
                        .orElse("Fournisseur Inconnu");
            }
        } else if (rep.getGaragePrestataire() != null && !rep.getGaragePrestataire().isEmpty()) {
            providerName = rep.getGaragePrestataire();
        }

        depense.setQui(providerName);
        depense.setSourceDepense("Réparation");
        depense.setSourceDepenseCustom(sourceCustom);
        if (rep.getEstPaye() != null) {
            depense.setEstPayee(rep.getEstPaye());
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
