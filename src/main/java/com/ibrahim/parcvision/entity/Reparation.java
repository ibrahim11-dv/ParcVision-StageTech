package com.ibrahim.parcvision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Data;

@Entity
@Data
@DiscriminatorValue("reparation")
public class Reparation extends Intervention{

    @Column(
            name = "piecesRemplacees"
    )
    private String piecesRemplacees;

    @Column(name = "garage_prestataire")
    private String garagePrestataire;

    @Column(name = "statut")
    private String statut;
}
