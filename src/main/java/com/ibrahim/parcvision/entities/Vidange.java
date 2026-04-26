package com.ibrahim.parcvision.entities;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("REPARATION")
public class Vidange extends Intervention{

    @Column(
            name = "type_huile"
    )
    private String typeHuile;

    private String viscosite;

    @Column(
            name = "filter_huile_change"
    )
    private boolean filterHuileChange;

    @Column(
            name = "filter_air_change"
    )
    private boolean filterAirChange;
    @Column(
            name = "filter_carburant_change"
    )
    private boolean filterCarburantChange;
}
