package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table
public class Admin {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "utilisateur_id"
    )
    @JsonBackReference
    private Utilisateur utilisateur;

}
