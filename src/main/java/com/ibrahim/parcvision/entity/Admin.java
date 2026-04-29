package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false
    )
    @JsonBackReference
    private Utilisateur utilisateur;

}
