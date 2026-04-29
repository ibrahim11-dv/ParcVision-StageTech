package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class Document {
    @Id
    @GeneratedValue
    private Long id;

    @Column(
            name = "nom_fichier"
    )
    private String nomFichier;

    private String type;

    private Long taille;

    @Column(
            name = "chemin_stockage"
    )
    private String cheminStockage;

    @Column(
            name = "date_upload"
    )
    private LocalDateTime dateUpload;

    @Column(
            name = "text_extrait_ocr"
    )
    private String textExtraitOCR;
    @Column(
            name = "meta_donees_index"
    )
    private String metaDonneesIndex;

    @OneToOne
    @JoinColumn(
            name = "conducteur_id"
    )
    @JsonBackReference
    private Conducteur conducteur;

    @OneToOne
    @JoinColumn(
            name = "vehicule_id"
    )
    @JsonBackReference
    private Vehicule vehicule;

    @OneToOne
    @JoinColumn(
            name = "mission_id"
    )
    @JsonBackReference
    private Mission mission;

    @OneToOne
    @JoinColumn(
            name = "intervention_id"
    )
    @JsonBackReference
    private Intervention intervention;

    @OneToOne
    @JoinColumn(
            name = "entreprise_id"
    )
    @JsonBackReference
    private Entreprise entreprise;

    @ManyToOne
    @JoinColumn(
            name = "dossier_archivage_id"
    )
    @JsonBackReference
    private DossierArchivage dossierArchivage;



}
