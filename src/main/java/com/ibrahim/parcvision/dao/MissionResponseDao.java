package com.ibrahim.parcvision.dao;

import com.ibrahim.parcvision.enums.StatutMission;
import com.ibrahim.parcvision.enums.TypeColis;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class MissionResponseDao {
    @NotNull
    private Long id;
    
    @NotBlank
    private String reference;
    
    // Conducteur info
    @NotNull
    private Long conducteurId;
    private String conducteurNomComplet;
    private String conducteurPhotoUrl;
    
    // Vehicule info
    @NotNull
    private Long vehiculeId;
    private String vehiculeMarqueModele;
    private String vehiculeImmatriculation;
    
    // Colis info
    private Long colisId;
    @NotBlank
    private String colisDescription;
    @Positive
    private Double colisPoids;
    @Positive
    private Double colisVolume;
    private String colisCodeSuivi;
    @NotNull
    private TypeColis colisType;
    
    // Trajet info
    @NotBlank
    private String adresseDepart;
    @NotBlank
    private String adresseArrivee;
    
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double latitudeDepart;
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double longitudeDepart;
    
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private Double latitudeDestination;
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private Double longitudeDestination;
    
    // Status
    @NotNull
    private StatutMission statut;
    
    // Dates
    @NotNull
    private LocalDateTime dateDebut;
    private LocalDateTime dateFinEstimee;
    private LocalDateTime dateFinReelle;
    
    private String instructionsSpeciales;
    private String preuveLivraisonUrl;

    public MissionResponseDao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public Long getConducteurId() {
        return conducteurId;
    }

    public void setConducteurId(Long conducteurId) {
        this.conducteurId = conducteurId;
    }

    public String getConducteurNomComplet() {
        return conducteurNomComplet;
    }

    public void setConducteurNomComplet(String conducteurNomComplet) {
        this.conducteurNomComplet = conducteurNomComplet;
    }

    public String getConducteurPhotoUrl() {
        return conducteurPhotoUrl;
    }

    public void setConducteurPhotoUrl(String conducteurPhotoUrl) {
        this.conducteurPhotoUrl = conducteurPhotoUrl;
    }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public String getVehiculeMarqueModele() {
        return vehiculeMarqueModele;
    }

    public void setVehiculeMarqueModele(String vehiculeMarqueModele) {
        this.vehiculeMarqueModele = vehiculeMarqueModele;
    }

    public String getVehiculeImmatriculation() {
        return vehiculeImmatriculation;
    }

    public void setVehiculeImmatriculation(String vehiculeImmatriculation) {
        this.vehiculeImmatriculation = vehiculeImmatriculation;
    }

    public Long getColisId() {
        return colisId;
    }

    public void setColisId(Long colisId) {
        this.colisId = colisId;
    }

    public String getColisDescription() {
        return colisDescription;
    }

    public void setColisDescription(String colisDescription) {
        this.colisDescription = colisDescription;
    }

    public Double getColisPoids() {
        return colisPoids;
    }

    public void setColisPoids(Double colisPoids) {
        this.colisPoids = colisPoids;
    }

    public Double getColisVolume() {
        return colisVolume;
    }

    public void setColisVolume(Double colisVolume) {
        this.colisVolume = colisVolume;
    }

    public String getColisCodeSuivi() {
        return colisCodeSuivi;
    }

    public void setColisCodeSuivi(String colisCodeSuivi) {
        this.colisCodeSuivi = colisCodeSuivi;
    }

    public TypeColis getColisType() {
        return colisType;
    }

    public void setColisType(TypeColis colisType) {
        this.colisType = colisType;
    }

    public String getAdresseDepart() {
        return adresseDepart;
    }

    public void setAdresseDepart(String adresseDepart) {
        this.adresseDepart = adresseDepart;
    }

    public String getAdresseArrivee() {
        return adresseArrivee;
    }

    public void setAdresseArrivee(String adresseArrivee) {
        this.adresseArrivee = adresseArrivee;
    }

    public Double getLatitudeDepart() {
        return latitudeDepart;
    }

    public void setLatitudeDepart(Double latitudeDepart) {
        this.latitudeDepart = latitudeDepart;
    }

    public Double getLongitudeDepart() {
        return longitudeDepart;
    }

    public void setLongitudeDepart(Double longitudeDepart) {
        this.longitudeDepart = longitudeDepart;
    }

    public Double getLatitudeDestination() {
        return latitudeDestination;
    }

    public void setLatitudeDestination(Double latitudeDestination) {
        this.latitudeDestination = latitudeDestination;
    }

    public Double getLongitudeDestination() {
        return longitudeDestination;
    }

    public void setLongitudeDestination(Double longitudeDestination) {
        this.longitudeDestination = longitudeDestination;
    }

    public StatutMission getStatut() {
        return statut;
    }

    public void setStatut(StatutMission statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDateTime dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDateTime getDateFinEstimee() {
        return dateFinEstimee;
    }

    public void setDateFinEstimee(LocalDateTime dateFinEstimee) {
        this.dateFinEstimee = dateFinEstimee;
    }

    public LocalDateTime getDateFinReelle() {
        return dateFinReelle;
    }

    public void setDateFinReelle(LocalDateTime dateFinReelle) {
        this.dateFinReelle = dateFinReelle;
    }

    public String getInstructionsSpeciales() {
        return instructionsSpeciales;
    }

    public void setInstructionsSpeciales(String instructionsSpeciales) {
        this.instructionsSpeciales = instructionsSpeciales;
    }

    public String getPreuveLivraisonUrl() {
        return preuveLivraisonUrl;
    }

    public void setPreuveLivraisonUrl(String preuveLivraisonUrl) {
        this.preuveLivraisonUrl = preuveLivraisonUrl;
    }
}
