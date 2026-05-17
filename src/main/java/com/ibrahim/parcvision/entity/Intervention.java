package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type_intervention")
public abstract class Intervention {
    @Id
    @GeneratedValue
    private Long id;

    @Column(name = "date_intervention")
    private LocalDate dateIntervention;

    @Column(length = 500, name = "description_panne")
    private String descriptionPanne;

    @Column(name = "actions_menees", columnDefinition = "TEXT")
    private String actionsMenees;

    @Column(name = "cout_total")
    private double coutTotal;

    @Column(name = "kilometrage_au_moment")
    private Long kilometrageAuMoment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    @JsonIgnoreProperties({"interventions", "documents"})
    private Vehicule vehicule;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDateIntervention() { return dateIntervention; }
    public void setDateIntervention(LocalDate dateIntervention) { this.dateIntervention = dateIntervention; }

    public String getDescriptionPanne() { return descriptionPanne; }
    public void setDescriptionPanne(String descriptionPanne) { this.descriptionPanne = descriptionPanne; }

    public String getActionsMenees() { return actionsMenees; }
    public void setActionsMenees(String actionsMenees) { this.actionsMenees = actionsMenees; }

    public double getCoutTotal() { return coutTotal; }
    public void setCoutTotal(double coutTotal) { this.coutTotal = coutTotal; }

    public Long getKilometrageAuMoment() { return kilometrageAuMoment; }
    public void setKilometrageAuMoment(Long kilometrageAuMoment) { this.kilometrageAuMoment = kilometrageAuMoment; }

    public Vehicule getVehicule() { return vehicule; }
    public void setVehicule(Vehicule vehicule) { this.vehicule = vehicule; }
}
