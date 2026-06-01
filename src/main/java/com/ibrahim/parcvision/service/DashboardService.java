package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.*;
import com.ibrahim.parcvision.enums.Statut;
import com.ibrahim.parcvision.enums.StatutMission;
import com.ibrahim.parcvision.enums.StatutVehicule;
import com.ibrahim.parcvision.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final VehiculeRepository vehiculeRepository;
    private final ConducteurRepository conducteurRepository;
    private final MissionRepository missionRepository;
    private final InterventionRepository interventionRepository;
    private final VidangeRepository vidangeRepository;
    private final ReparationRepository reparationRepository;
    private final DepannageRepository depannageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;

    public DashboardService(VehiculeRepository vehiculeRepository,
                            ConducteurRepository conducteurRepository,
                            MissionRepository missionRepository,
                            InterventionRepository interventionRepository,
                            VidangeRepository vidangeRepository,
                            ReparationRepository reparationRepository,
                            DepannageRepository depannageRepository,
                            UtilisateurRepository utilisateurRepository,
                            JwtService jwtService) {
        this.vehiculeRepository = vehiculeRepository;
        this.conducteurRepository = conducteurRepository;
        this.missionRepository = missionRepository;
        this.interventionRepository = interventionRepository;
        this.vidangeRepository = vidangeRepository;
        this.reparationRepository = reparationRepository;
        this.depannageRepository = depannageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
    }

    private Utilisateur getUserFromRequest(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    public ResponseEntity<Map<String, Object>> getDashboardStats(HttpServletRequest request) {
        try {
            Utilisateur user = getUserFromRequest(request);
            Long entrepriseId = user.getEntreprise().getId();
            Map<String, Object> stats = new LinkedHashMap<>();

            // ── KPI Cards ──────────────────────────────────────────────
            long totalVehicules = vehiculeRepository.findByEntreprise_Id(entrepriseId).size();
            long totalConducteurs = conducteurRepository.countByUtilisateur_Entreprise_Id(entrepriseId);
            long totalMissions = missionRepository.countByEntreprise_Id(entrepriseId);
            long totalInterventions = interventionRepository.countByVehicule_Entreprise_Id(entrepriseId);

            stats.put("totalVehicules", totalVehicules);
            stats.put("totalConducteurs", totalConducteurs);
            stats.put("totalMissions", totalMissions);
            stats.put("totalInterventions", totalInterventions);

            // ── Advanced KPIs ──────────────────────────────────────────
            List<Intervention> interventions = interventionRepository.findByVehicule_Entreprise_Id(entrepriseId);
            double totalCost = interventions.stream().mapToDouble(Intervention::getCoutTotal).sum();
            stats.put("totalCost", totalCost);

            double avgCostPerVehicule = totalVehicules > 0 ? totalCost / totalVehicules : 0;
            stats.put("avgCostPerVehicule", Math.round(avgCostPerVehicule));

            List<Vehicule> vehicules = vehiculeRepository.findByEntreprise_Id(entrepriseId);
            long enMissionCount = vehicules.stream().filter(v -> v.getStatutVehicule() == StatutVehicule.EN_MISSION).count();
            double utilizationRate = totalVehicules > 0 ? ((double) enMissionCount / totalVehicules) * 100 : 0;
            stats.put("utilizationRate", Math.round(utilizationRate));

            // Maintenance Alerts (Vehicles needing vidange soon - say every 10k km)
            long maintenanceAlertsCount = 0;
            for (Vehicule v : vehicules) {
                Long currentKm = v.getKilometrageActuel() != null ? v.getKilometrageActuel() : 0L;
                Optional<Vidange> lastVidange = vidangeRepository.findByVehicule_Id(v.getId()).stream()
                        .max(Comparator.comparing(Intervention::getDateIntervention));
                
                Long lastVidangeKm = lastVidange.map(Intervention::getKilometrageAuMoment).orElse(0L);
                if (currentKm - lastVidangeKm > 9000) { // Alert at 9000km since last vidange
                    maintenanceAlertsCount++;
                }
            }
            stats.put("maintenanceAlertsCount", maintenanceAlertsCount);

            // ── Vehicle Status Distribution ────────────────────────────
            Map<String, Long> vehiculeStatuts = new LinkedHashMap<>();
            vehiculeStatuts.put("DISPONIBLE", vehicules.stream().filter(v -> v.getStatutVehicule() == StatutVehicule.DISPONIBLE).count());
            vehiculeStatuts.put("EN_MISSION", enMissionCount);
            vehiculeStatuts.put("EN_MAINTENANCE", vehicules.stream().filter(v -> v.getStatutVehicule() == StatutVehicule.EN_MAINTENANCE).count());
            vehiculeStatuts.put("HORS_SERVICE", vehicules.stream().filter(v -> v.getStatutVehicule() == StatutVehicule.HORS_SERVICE).count());
            stats.put("vehiculeStatuts", vehiculeStatuts);

            // ── Monthly Intervention Data (last 6 months) ──────────────
            List<Mission> missions = missionRepository.findByEntreprise_Id(entrepriseId);
            List<Map<String, Object>> monthlyData = new ArrayList<>();
            LocalDate now = LocalDate.now();
            String[] monthNames = {"Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"};
            for (int i = 5; i >= 0; i--) {
                LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
                LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
                int monthIdx = monthStart.getMonthValue() - 1;

                long monthInterventions = interventions.stream()
                        .filter(inter -> inter.getDateIntervention() != null
                                && !inter.getDateIntervention().isBefore(monthStart)
                                && !inter.getDateIntervention().isAfter(monthEnd))
                        .count();

                double monthCost = interventions.stream()
                        .filter(inter -> inter.getDateIntervention() != null
                                && !inter.getDateIntervention().isBefore(monthStart)
                                && !inter.getDateIntervention().isAfter(monthEnd))
                        .mapToDouble(Intervention::getCoutTotal)
                        .sum();

                long monthMissions = missions.stream()
                        .filter(m -> m.getDataDebut() != null
                                && !m.getDataDebut().isBefore(monthStart)
                                && !m.getDataDebut().isAfter(monthEnd))
                        .count();

                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("month", monthNames[monthIdx]);
                entry.put("interventions", monthInterventions);
                entry.put("cost", monthCost);
                entry.put("missions", monthMissions);
                monthlyData.add(entry);
            }
            stats.put("monthlyData", monthlyData);

            // ── Recent Interventions (last 10) ────────────────────────
            List<Map<String, Object>> recentInterventions = interventions.stream()
                    .filter(i -> i.getDateIntervention() != null)
                    .sorted(Comparator.comparing(Intervention::getDateIntervention).reversed())
                    .limit(10)
                    .map(inter -> {
                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("id", inter.getId());
                        map.put("date", inter.getDateIntervention().toString());
                        map.put("cost", inter.getCoutTotal());
                        map.put("description", inter.getDescriptionPanne() != null ? inter.getDescriptionPanne() : "—");
                        map.put("vehicule", inter.getVehicule() != null ?
                                inter.getVehicule().getMarque() + " " + inter.getVehicule().getModel() +
                                        " (" + inter.getVehicule().getImmatriculation() + ")" : "—");
                        // Determine type
                        if (inter instanceof Vidange) map.put("type", "Vidange");
                        else if (inter instanceof Reparation) map.put("type", "Réparation");
                        else if (inter instanceof Depannage) map.put("type", "Dépannage");
                        else map.put("type", "Autre");
                        return map;
                    })
                    .collect(Collectors.toList());
            stats.put("recentInterventions", recentInterventions);

            // ── Vehicle Type Distribution ──────────────────────────────
            Map<String, Long> vehiculeTypes = new LinkedHashMap<>();
            vehiculeTypes.put("CAMION", vehicules.stream().filter(v -> v.getTypeVehicule() != null && v.getTypeVehicule().name().equals("CAMION")).count());
            vehiculeTypes.put("FOURGON", vehicules.stream().filter(v -> v.getTypeVehicule() != null && v.getTypeVehicule().name().equals("FOURGON")).count());
            vehiculeTypes.put("VOITURE", vehicules.stream().filter(v -> v.getTypeVehicule() != null && v.getTypeVehicule().name().equals("VOITURE")).count());
            stats.put("vehiculeTypes", vehiculeTypes);

            // ── Intervention Types Distribution ────────────────────────
            Map<String, Long> interventionTypes = new LinkedHashMap<>();
            interventionTypes.put("Vidange", interventions.stream().filter(i -> i instanceof Vidange).count());
            interventionTypes.put("Réparation", interventions.stream().filter(i -> i instanceof Reparation).count());
            interventionTypes.put("Dépannage", interventions.stream().filter(i -> i instanceof Depannage).count());
            stats.put("interventionTypes", interventionTypes);

            // ── Mission Status Distribution ────────────────────────────
            Map<String, Long> missionStatuts = new LinkedHashMap<>();
            missionStatuts.put("PLANIFIEE", missions.stream().filter(m -> m.getStatut() == StatutMission.PLANIFIEE).count());
            missionStatuts.put("EN_COURS", missions.stream().filter(m -> m.getStatut() == StatutMission.EN_COURS).count());
            missionStatuts.put("TERMINEE", missions.stream().filter(m -> m.getStatut() == StatutMission.TERMINEE).count());
            missionStatuts.put("ANNULEE", missions.stream().filter(m -> m.getStatut() == StatutMission.ANNULEE).count());
            stats.put("missionStatuts", missionStatuts);

            // ── Conducteur Status Distribution ─────────────────────────
            List<Conducteur> conducteurs = conducteurRepository.findAll().stream()
                    .filter(c -> c.getUtilisateur() != null && c.getUtilisateur().getEntreprise() != null && c.getUtilisateur().getEntreprise().getId().equals(entrepriseId))
                    .collect(Collectors.toList());
            Map<String, Long> conducteurStatuts = new LinkedHashMap<>();
            conducteurStatuts.put("DISPONIBLE", conducteurs.stream().filter(c -> c.getStatut() == Statut.DISPONIBLE).count());
            conducteurStatuts.put("EN_MISSION", conducteurs.stream().filter(c -> c.getStatut() == Statut.EN_MISSION).count());
            conducteurStatuts.put("EN_CONGE", conducteurs.stream().filter(c -> c.getStatut() == Statut.EN_CONGE).count());
            conducteurStatuts.put("MALADE", conducteurs.stream().filter(c -> c.getStatut() == Statut.MALADE).count());
            conducteurStatuts.put("SUSPENDU", conducteurs.stream().filter(c -> c.getStatut() == Statut.SUSPENDU).count());
            stats.put("conducteurStatuts", conducteurStatuts);

            // ── Fleet Health Score ─────────────────────────────────────
            long disponible = vehiculeStatuts.getOrDefault("DISPONIBLE", 0L);
            long enMission = vehiculeStatuts.getOrDefault("EN_MISSION", 0L);
            double healthScore = totalVehicules > 0 ? ((double)(disponible + enMission) / totalVehicules) * 100 : 100;
            stats.put("fleetHealthScore", Math.round(healthScore));

            // ── Entreprise Info ────────────────────────────────────────
            Entreprise ent = user.getEntreprise();
            Map<String, Object> entrepriseInfo = new LinkedHashMap<>();
            entrepriseInfo.put("nom", ent.getNom());
            entrepriseInfo.put("secteur", ent.getSecteurActivite());
            stats.put("entreprise", entrepriseInfo);

            return new ResponseEntity<>(stats, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
