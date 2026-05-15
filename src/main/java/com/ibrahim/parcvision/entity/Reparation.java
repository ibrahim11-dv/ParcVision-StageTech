package com.ibrahim.parcvision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("reparation")
public class Reparation extends Intervention {

    @Column(name = "piecesRemplacees")
    private String piecesRemplacees;

    @Column(name = "garage_prestataire")
    private String garagePrestataire;

    @Column(name = "statut")
    private String statut;

    // Getters and Setters
    public String getPiecesRemplacees() { return piecesRemplacees; }
    public void setPiecesRemplacees(String piecesRemplacees) { this.piecesRemplacees = piecesRemplacees; }

    public String getGaragePrestataire() { return garagePrestataire; }
    public void setGaragePrestataire(String garagePrestataire) { this.garagePrestataire = garagePrestataire; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
