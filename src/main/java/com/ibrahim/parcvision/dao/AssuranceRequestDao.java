package com.ibrahim.parcvision.dao;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

public class AssuranceRequestDao {

    private Long id;
    private Long vehiculeId;
    private String typeAssurance;
    private LocalDate dateDebut;
    private LocalDate dateExpiration;
    private Integer nombreMois;
    private String nomPrestataire;
    private Double montant;
    private MultipartFile attestation;

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
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

    public MultipartFile getAttestation() {
        return attestation;
    }

    public void setAttestation(MultipartFile attestation) {
        this.attestation = attestation;
    }
}
