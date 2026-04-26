package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ibrahim.parcvision.enums.Role;
import jakarta.persistence.*;

@Entity
@Table(name = "utilisateur")
public class Utilisateur {
    @Id
    @GeneratedValue
    private Long  id;
    @Column(
            length = 20,
            nullable = false
    )
    private String nom;
    @Column(
            length = 20,
            nullable = false
    )
    private String prenom;
    @Column(
            nullable = false,
            unique = true
    )

    private String email;
    @Column(
            nullable = false,
            unique = true,
            length = 10
    )

    private String telephone;
    @Column(
            nullable = false
    )
    @Enumerated(EnumType.STRING)
    private Role role;

    @ManyToOne
    @JoinColumn(
            name ="entreprise_id",
            nullable = false
    )
    @JsonBackReference
    private Entreprise entreprise;

    @OneToOne(
            mappedBy = "utilisateur"
    )
    @JsonManagedReference
    private Conducteur conducteur;

    @OneToOne(
            mappedBy = "utilisateur"
    )
    @JsonManagedReference
    private Admin admin;
}
