package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSourceExtensionsKt;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "entreprise")
public class Entreprise {
    @Id
    @GeneratedValue
    private Long  id;

    @Column(
            length = 50,
            unique = true,
            nullable = false
    )
    private String nom;
    @Column(
            unique = true
    )
    private String adresse;
    @Column(
            length = 10,
            unique = true,
            nullable = false
    )
    private String telephone;
    @Column(
            unique = true,
            nullable = false
    )
    private String email;
    @Column(
            name = "secteur_activite"
    )
    private String secteurActivite;
    @Column(
            name = "date_creation"
    )
    private LocalDate dateCreation;

    @OneToMany(
            mappedBy = "entreprise"
    )
    @JsonManagedReference
    private List<Utilisateur> utilisateur;


}
