package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class Assurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicule_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Vehicule vehicule;

    @Column(name = "type_assurance")
    private String typeAssurance;

    @Column(name = "date_debut")
    private LocalDate dateDebut;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Column(name = "nombre_mois")
    private Integer nombreMois;

    @Column(name = "nom_prestataire")
    private String nomPrestataire;

    @Column(name = "montant")
    private Double montant;

    @Column(name = "date_paiement")
    private LocalDate datePaiement;

    @Column(name = "est_payee")
    private Boolean estPayee;

    @Column(name = "attestation_url")
    private String attestationUrl;

    public Assurance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicule getVehicule() {
        return vehicule;
    }

    public void setVehicule(Vehicule vehicule) {
        this.vehicule = vehicule;
    }

    public String getTypeAssurance() {
        return typeAssurance;
    }

    public void setTypeAssurance(String typeAssurance) {
        this.typeAssurance = typeAssurance;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public Integer getNombreMois() {
        return nombreMois;
    }

    public void setNombreMois(Integer nombreMois) {
        this.nombreMois = nombreMois;
    }

    public String getNomPrestataire() {
        return nomPrestataire;
    }

    public void setNomPrestataire(String nomPrestataire) {
        this.nomPrestataire = nomPrestataire;
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

    public String getAttestationUrl() {
        return attestationUrl;
    }

    public void setAttestationUrl(String attestationUrl) {
        this.attestationUrl = attestationUrl;
    }
}
