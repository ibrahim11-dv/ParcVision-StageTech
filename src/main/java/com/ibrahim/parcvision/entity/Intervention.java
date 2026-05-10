package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type_intervention")
public abstract class Intervention {
    @Id
    @GeneratedValue
    private Long id;

    @Column(
            name = "date_intervention"
    )
    private LocalDate dateIntervention;

    @Column(
            length = 500,
            name = "description_panne"
    )
    private String descriptionPanne;

    @Column(
            name = "actions_menees"
    )
    private String actionsMenees;

    @Column(
            name = "cout_total"
    )
    private double coutTotal;

    @Column(
            name = "kilometrage_au_moment"
    )
    private Long kilometrageAuMoment;

    @ManyToOne()
    @JoinColumn(name = "vehicule_id", nullable = false)
    @JsonIgnoreProperties({"interventions", "documents"})
    private Vehicule vehicule;


}
