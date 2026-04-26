package com.ibrahim.parcvision.entities;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type_intervention")
public abstract class Intervention {
    @Id
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




}
