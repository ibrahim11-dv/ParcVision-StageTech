package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@DiscriminatorValue("accident")  // Pour distinguer Accident des autres types d'Intervention
public class Accident extends Intervention {  // ← Doit extends Intervention

    @Column(name = "lieu")
    private String lieu;

    @Column(name = "contexte")
    private String contexte;

    @Column(name = "gravite")
    private String gravite;

    @Column(name = "budget_estime")
    private double budgetEstime;

    @Column(name = "etat")
    private String etat;

    @ManyToOne
    @JoinColumn(name = "conducteur_id")
    @JsonIgnoreProperties({"accidents", "mission", "document"})
    private Conducteur conducteur;

    @Column(name = "notes")
    private String notes;

}