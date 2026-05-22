package com.ibrahim.parcvision.dao;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

public class InfractionRequestDao {

    private Long id;
    private Long missionId;
    private Long vehiculeId;
    private Long conducteurId;
    private LocalDate dateCommis;
    private String categorie;
    private String description;
    private LocalDate dateLimitePaiement;
    private Double montant;
    private MultipartFile fichier;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMissionId() {
        return missionId;
    }

    public void setMissionId(Long missionId) {
        this.missionId = missionId;
    }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public Long getConducteurId() {
        return conducteurId;
    }

    public void setConducteurId(Long conducteurId) {
        this.conducteurId = conducteurId;
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

    public MultipartFile getFichier() {
        return fichier;
    }

    public void setFichier(MultipartFile fichier) {
        this.fichier = fichier;
    }
}
