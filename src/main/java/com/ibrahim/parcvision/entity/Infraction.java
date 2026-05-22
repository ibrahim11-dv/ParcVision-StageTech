package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Infraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mission_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "entreprise", "conducteur", "vehicule", "colis", "pointGPS"})
    private Mission mission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "entreprise"})
    private Vehicule vehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conducteur_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "entreprise"})
    private Conducteur conducteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonIgnore
    private Entreprise entreprise;

    @Column(name = "date_commis")
    private LocalDate dateCommis;

    private String categorie;

    @Column(length = 1000)
    private String description;

    @Column(name = "fichier_infraction_url")
    private String fichierInfractionUrl;

    @Column(name = "date_limite_paiement")
    private LocalDate dateLimitePaiement;

    private Double montant;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(name = "est_payee")
    private Boolean estPayee;

    public Infraction() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }

    public Conducteur getConducteur() {
        return conducteur;
    }

    public void setConducteur(Conducteur conducteur) {
        this.conducteur = conducteur;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }

    public LocalDate getDateCommis() {
        return dateCommis;
    }

    public void setDateCommis(LocalDate dateCommis) {
        this.dateCommis = dateCommis;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFichierInfractionUrl() {
        return fichierInfractionUrl;
    }

    public void setFichierInfractionUrl(String fichierInfractionUrl) {
        this.fichierInfractionUrl = fichierInfractionUrl;
    }

    public LocalDate getDateLimitePaiement() {
        return dateLimitePaiement;
    }

    public void setDateLimitePaiement(LocalDate dateLimitePaiement) {
        this.dateLimitePaiement = dateLimitePaiement;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public LocalDate getDatePaiement() {
        return datePaiement;
    }

    public void setDatePaiement(LocalDate datePaiement) {
        this.datePaiement = datePaiement;
    }

    public Boolean getEstPayee() {
        return estPayee;
    }

    public void setEstPayee(Boolean estPayee) {
        this.estPayee = estPayee;
    }
}
