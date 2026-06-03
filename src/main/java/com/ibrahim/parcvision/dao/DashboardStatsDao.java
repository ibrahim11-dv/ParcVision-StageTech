package com.ibrahim.parcvision.dao;

import java.util.Map;

public class DashboardStatsDao {
    private long totalVehicules;
    private long vehiculesDisponibles;
    private long vehiculesEnMission;
    private long vehiculesEnMaintenance;

    private long totalConducteurs;
    private long conducteursDisponibles;
    private long conducteursEnMission;
    private long conducteursEnConge;

    private long totalMissions;
    private long missionsEnCours;
    
    private long totalInterventions;
    private double coutTotalInterventions;

    private long nbReparations;
    private long nbAccidents;
    private long nbDepannages;
    private long nbVidanges;
    private long nbFournisseurs;

    private long totalAssurances;
    private long totalInfractions;
    private long totalDepenses;
    private double coutTotalDepenses;

    private Map<String, Map<String, Long>> missionsParJour;

    // Default constructor
    public DashboardStatsDao() {}

    // Getters and Setters
    public long getTotalVehicules() { return totalVehicules; }
    public void setTotalVehicules(long totalVehicules) { this.totalVehicules = totalVehicules; }

    public long getVehiculesDisponibles() { return vehiculesDisponibles; }
    public void setVehiculesDisponibles(long vehiculesDisponibles) { this.vehiculesDisponibles = vehiculesDisponibles; }

    public long getVehiculesEnMission() { return vehiculesEnMission; }
    public void setVehiculesEnMission(long vehiculesEnMission) { this.vehiculesEnMission = vehiculesEnMission; }

    public long getVehiculesEnMaintenance() { return vehiculesEnMaintenance; }
    public void setVehiculesEnMaintenance(long vehiculesEnMaintenance) { this.vehiculesEnMaintenance = vehiculesEnMaintenance; }

    public long getTotalConducteurs() { return totalConducteurs; }
    public void setTotalConducteurs(long totalConducteurs) { this.totalConducteurs = totalConducteurs; }

    public long getConducteursDisponibles() { return conducteursDisponibles; }
    public void setConducteursDisponibles(long conducteursDisponibles) { this.conducteursDisponibles = conducteursDisponibles; }

    public long getConducteursEnMission() { return conducteursEnMission; }
    public void setConducteursEnMission(long conducteursEnMission) { this.conducteursEnMission = conducteursEnMission; }

    public long getConducteursEnConge() { return conducteursEnConge; }
    public void setConducteursEnConge(long conducteursEnConge) { this.conducteursEnConge = conducteursEnConge; }

    public long getTotalMissions() { return totalMissions; }
    public void setTotalMissions(long totalMissions) { this.totalMissions = totalMissions; }

    public long getMissionsEnCours() { return missionsEnCours; }
    public void setMissionsEnCours(long missionsEnCours) { this.missionsEnCours = missionsEnCours; }

    public long getTotalInterventions() { return totalInterventions; }
    public void setTotalInterventions(long totalInterventions) { this.totalInterventions = totalInterventions; }

    public double getCoutTotalInterventions() { return coutTotalInterventions; }
    public void setCoutTotalInterventions(double coutTotalInterventions) { this.coutTotalInterventions = coutTotalInterventions; }

    public long getNbReparations() { return nbReparations; }
    public void setNbReparations(long nbReparations) { this.nbReparations = nbReparations; }

    public long getNbAccidents() { return nbAccidents; }
    public void setNbAccidents(long nbAccidents) { this.nbAccidents = nbAccidents; }

    public long getNbDepannages() { return nbDepannages; }
    public void setNbDepannages(long nbDepannages) { this.nbDepannages = nbDepannages; }

    public long getNbVidanges() { return nbVidanges; }
    public void setNbVidanges(long nbVidanges) { this.nbVidanges = nbVidanges; }

    public long getNbFournisseurs() { return nbFournisseurs; }
    public void setNbFournisseurs(long nbFournisseurs) { this.nbFournisseurs = nbFournisseurs; }

    public long getTotalAssurances() { return totalAssurances; }
    public void setTotalAssurances(long totalAssurances) { this.totalAssurances = totalAssurances; }

    public long getTotalInfractions() { return totalInfractions; }
    public void setTotalInfractions(long totalInfractions) { this.totalInfractions = totalInfractions; }

    public long getTotalDepenses() { return totalDepenses; }
    public void setTotalDepenses(long totalDepenses) { this.totalDepenses = totalDepenses; }

    public double getCoutTotalDepenses() { return coutTotalDepenses; }
    public void setCoutTotalDepenses(double coutTotalDepenses) { this.coutTotalDepenses = coutTotalDepenses; }

    public Map<String, Map<String, Long>> getMissionsParJour() { return missionsParJour; }
    public void setMissionsParJour(Map<String, Map<String, Long>> missionsParJour) { this.missionsParJour = missionsParJour; }
}
