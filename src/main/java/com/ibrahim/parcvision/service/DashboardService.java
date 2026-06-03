package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.DashboardStatsDao;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Statut;
import com.ibrahim.parcvision.enums.StatutVehicule;
import com.ibrahim.parcvision.repository.ConducteurRepository;
import com.ibrahim.parcvision.repository.InterventionRepository;
import com.ibrahim.parcvision.repository.MissionRepository;
import com.ibrahim.parcvision.repository.AssuranceRepository;
import com.ibrahim.parcvision.repository.InfractionRepository;
import com.ibrahim.parcvision.repository.DepenseRepository;
import com.ibrahim.parcvision.repository.FournisseurRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.ibrahim.parcvision.entity.Reparation;
import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.entity.Accident;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private VehiculeRepository vehiculeRepository;

    @Autowired
    private ConducteurRepository conducteurRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private InterventionRepository interventionRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    @Autowired
    private AssuranceRepository assuranceRepository;

    @Autowired
    private InfractionRepository infractionRepository;

    @Autowired
    private DepenseRepository depenseRepository;

    public DashboardStatsDao getDashboardStats() {
        String emailAdmin = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur admin = utilisateurRepository.findByEmail(emailAdmin)
                .orElseThrow(() -> new RuntimeException("Administrateur non trouvé"));
        
        Entreprise entreprise = admin.getEntreprise();
        if (entreprise == null) {
            throw new RuntimeException("L'administrateur n'est rattaché à aucune entreprise");
        }

        DashboardStatsDao stats = new DashboardStatsDao();

        // Vehicules
        stats.setTotalVehicules(vehiculeRepository.countByEntreprise(entreprise));
        stats.setVehiculesDisponibles(vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.DISPONIBLE, entreprise));
        stats.setVehiculesEnMission(vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.EN_MISSION, entreprise));
        stats.setVehiculesEnMaintenance(vehiculeRepository.countByStatutVehiculeAndEntreprise(StatutVehicule.EN_MAINTENANCE, entreprise));

        // Conducteurs
        stats.setTotalConducteurs(conducteurRepository.countByUtilisateurEntreprise(entreprise));
        stats.setConducteursDisponibles(conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.DISPONIBLE, entreprise));
        stats.setConducteursEnMission(conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.EN_MISSION, entreprise));
        stats.setConducteursEnConge(conducteurRepository.countByStatutAndUtilisateurEntreprise(Statut.EN_CONGE, entreprise));

        // Missions & Interventions
        stats.setTotalMissions(missionRepository.countByEntreprise(entreprise));
        stats.setTotalInterventions(interventionRepository.countByVehiculeEntreprise(entreprise));
        
        Double coutTotal = interventionRepository.sumCoutTotalByEntreprise(entreprise);
        stats.setCoutTotalInterventions(coutTotal != null ? coutTotal : 0.0);

        stats.setMissionsEnCours(missionRepository.countMissionsEnCoursByEntreprise(entreprise));
        stats.setNbFournisseurs(fournisseurRepository.countByEntreprise(entreprise));
        stats.setTotalAssurances(assuranceRepository.countByEntreprise(entreprise));
        stats.setTotalInfractions(infractionRepository.countByEntreprise(entreprise));
        stats.setTotalDepenses(depenseRepository.countByEntreprise(entreprise));
        
        Double coutDepenses = depenseRepository.sumMontantByEntreprise(entreprise);
        stats.setCoutTotalDepenses(coutDepenses != null ? coutDepenses : 0.0);

        List<Object[]> interventionsByType = interventionRepository.countInterventionsByType(entreprise);
        for (Object[] row : interventionsByType) {
            Class<?> type = (Class<?>) row[0];
            Long count = (Long) row[1];
            if (type.equals(Reparation.class)) {
                stats.setNbReparations(count);
            } else if (type.equals(Depannage.class)) {
                stats.setNbDepannages(count);
            } else if (type.equals(Vidange.class)) {
                stats.setNbVidanges(count);
            } else if (type.equals(Accident.class)) {
                stats.setNbAccidents(count);
            }
        }

        // Missions Par Jour (Graphique Ligne)
        List<Object[]> rawDailyMissions = missionRepository.countMissionsByDayAndStatut(entreprise);
        Map<String, Map<String, Long>> missionsParJour = new LinkedHashMap<>();

        for (Object[] row : rawDailyMissions) {
            String date = row[0].toString();
            String statut = row[1].toString();
            Long count = (Long) row[2];

            missionsParJour.putIfAbsent(date, new LinkedHashMap<>());
            missionsParJour.get(date).put(statut, count);
        }

        stats.setMissionsParJour(missionsParJour);

        return stats;
    }
}
