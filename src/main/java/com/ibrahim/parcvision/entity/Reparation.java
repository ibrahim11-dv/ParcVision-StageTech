package com.ibrahim.parcvision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("reparation")
public class Reparation extends Intervention{

    @Column(
            name = "piecesRemplacees"
    )
    private String piecesRemplacees;
}
