package com.ibrahim.parcvision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("depannage")
public class Depannage extends Intervention {

    @Column(name = "lieu_panne")
    private String lieuPanne;

    @Column(name = "necessite_remorquage")
    private boolean necessiteRemorquage;

    @Column(name = "nom_depanneur_externe")
    private String nomDepanneurExterne;

    @Column(name = "statut")
    private String statut;

    // Getters and Setters
    public String getLieuPanne() { return lieuPanne; }
    public void setLieuPanne(String lieuPanne) { this.lieuPanne = lieuPanne; }

    public boolean isNecessiteRemorquage() { return necessiteRemorquage; }
    public void setNecessiteRemorquage(boolean necessiteRemorquage) { this.necessiteRemorquage = necessiteRemorquage; }

    public String getNomDepanneurExterne() { return nomDepanneurExterne; }
    public void setNomDepanneurExterne(String nomDepanneurExterne) { this.nomDepanneurExterne = nomDepanneurExterne; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}
