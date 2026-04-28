package com.ibrahim.parcvision.entities;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("depannage")
public class Depannage extends Intervention{

    @Column(
            name = "lieu_panne"
    )
    private String lieuPanne;

    @Column(
            name = "necessite_remorquage"
    )
    private boolean necessiteRemorquage;

    @Column(
            name = "nom_depanneur_externe"
    )
    private String nomDepanneurExterne;
}
