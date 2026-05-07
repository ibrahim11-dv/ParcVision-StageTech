package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ibrahim.parcvision.enums.StatutMission;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Mission {
    @Id
    @GeneratedValue
    private Long id;

    @Column(
            name = "date_debut",
            nullable = false
    )
    private LocalDateTime dataDebut;

    @Column(
            name = "date_fin_estimee",
            nullable = false
    )
    private LocalDateTime dateFinEstimee;

    @Column(name = "date_fin_reelle")
    private LocalDateTime dateFinReelle;

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
            name = "entreprise_id",
            nullable = false
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

    @OneToMany(
            mappedBy = "mission"
    )
    @JsonManagedReference
    private List<PointGPS> PointGPS;

    @OneToOne(
            mappedBy = "mission"
    )
    @JsonManagedReference
    private Document document;

    @OneToMany
    @JsonManagedReference
    private List<Colis> colis;


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDataDebut() {
        return dataDebut;
    }

    public void setDataDebut(LocalDate dataDebut) {
        this.dataDebut = dataDebut;
    }

    public LocalDate getDateFinEstimee() {
        return dateFinEstimee;
    }

    public void setDateFinEstimee(LocalDate dateFinEstimee) {
        this.dateFinEstimee = dateFinEstimee;
    }

    public LocalDate getDateFinReelle() {
        return dateFinReelle;
    }

    public void setDateFinReelle(LocalDate dateFinReelle) {
        this.dateFinReelle = dateFinReelle;
    }

    public String getAdresseDepart() {
        return adresseDepart;
    }

    public void setAdresseDepart(String adresseDepart) {
        this.adresseDepart = adresseDepart;
    }

    public String getAdressArrivee() {
        return adressArrivee;
    }

    public void setAdressArrivee(String adressArrivee) {
        this.adressArrivee = adressArrivee;
    }

    public String getInstructionsSpeciales() {
        return instructionsSpeciales;
    }

    public void setInstructionsSpeciales(String instructionsSpeciales) {
        this.instructionsSpeciales = instructionsSpeciales;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public StatutMission getStatut() {
        return statut;
    }

    public void setStatut(StatutMission statut) {
        this.statut = statut;
    }

    public String getPreuveLivraisonUrl() {
        return preuveLivraisonUrl;
    }

    public void setPreuveLivraisonUrl(String preuveLivraisonUrl) {
        this.preuveLivraisonUrl = preuveLivraisonUrl;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }

    public Conducteur getConducteur() {
        return conducteur;
    }

    public void setConducteur(Conducteur conducteur) {
        this.conducteur = conducteur;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }

    public List<PointGPS> getPointGPS() {
        return PointGPS;
    }

    public void setPointGPS(List<PointGPS> PointGPS) {
        this.PointGPS = PointGPS;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }

    public List<Colis> getColis() {
        return colis;
    }

    public void setColis(List<Colis> colis) {
        this.colis = colis;
    }
}
