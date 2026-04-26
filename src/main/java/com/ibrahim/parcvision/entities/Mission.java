package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ibrahim.parcvision.enums.StatutMission;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Mission {
    @Id
    @GeneratedValue
    private Long id;

    @Column(
            name = "date_debut",
            nullable = false
    )
    private LocalDate dataDebut;

    @Column(
            name = "date_fin_estimee",
            nullable = false
    )
    private LocalDate dateFinEstimee;

    @Column(name = "date_fin_reelle")
    private LocalDate dateFinReelle;

    @Column(
            name = "adresse_depart",
            nullable = false
    )
    private String adresseDepart;

    @Column(
            name = "adresse_arrivee",
            nullable = false
    )
    private String adressArrivee;

    @Column(
            name = "instructions_speciales",
            nullable = false,
            length = 500
    )
    private String instructionsSpeciales;

    private String reference;

    @Enumerated(EnumType.STRING)
    private StatutMission statut;

    @Column(name = "preuve_livraison_url")
    private String preuveLivraisonUrl;

    @ManyToOne
    @JoinColumn(
            name = "entreprise_id"
    )
    @JsonBackReference
    private Entreprise entreprise;

    @ManyToOne
    @JoinColumn(
            name = "conducteur_id"
    )
    @JsonBackReference
    private Conducteur conducteur;

    @ManyToOne
    @JoinColumn(
            name = "vehicule_id"
    )
    @JsonBackReference
    private Vehicule vehicule;


}
