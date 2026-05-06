package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ibrahim.parcvision.enums.TypeColis;
import jakarta.persistence.*;

@Entity
public class Colis {
    @Id
    private Long id;

    private String description;
    private Double poids;
    @Column(name = "code_suivi")
    private String codeSuivi;
    @Column(name = "est_livre")
    private boolean estLivre;
    private TypeColis type;

    @ManyToOne()
    @JoinColumn( name = "mission_id")
    @JsonIgnore
    private Mission mission;


}
