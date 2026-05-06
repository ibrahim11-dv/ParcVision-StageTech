package com.ibrahim.parcvision.dao;

import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.PointGPS;
import com.ibrahim.parcvision.entity.Vehicule;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class AddMissionDao {
    @NotNull
    private Long conducteurId;
    @NotNull
    private Long vehiculeId;

    @NotBlank
    @Size(max = 255)
    private String adressDepart;

    @NotBlank
    @DecimalMax("-180.0")
    @DecimalMin("180.0")
    private Double longitudeDepart;

    @NotBlank
    @DecimalMax("-90.0")
    @DecimalMin("90.0")
    private Double latitudeDepart;

    @NotBlank
    @Size(max = 255)
    private String adressDestination;
    @NotBlank
    @DecimalMax("-180.0")
    @DecimalMin("180.0")
    private Double longitudeDestination;
    @NotBlank
    @DecimalMax("-90.0")
    @DecimalMin("90.0")
    private Double latitudeDestination;

    @NotNull
    private LocalDateTime dateDepart;
    @Future
    private LocalDateTime dateArrivee;

    @NotBlank @Size(max = 500)
    private String description;
    @Positive
    private Double poids;
    @Positive
    private Double Volume;

    private String InstructionSpeciales;

    public Long getConducteurId() {
        return conducteurId;
    }

    public void setConducteurId(Long conducteurId) {
        this.conducteurId = conducteurId;
    }

    public Long getVehiculeId() {
        return vehiculeId;
    }

    public void setVehiculeId(Long vehiculeId) {
        this.vehiculeId = vehiculeId;
    }

    public String getAdressDepart() {
        return adressDepart;
    }

    public void setAdressDepart(String adressDepart) {
        this.adressDepart = adressDepart;
    }

    public Double getLongitudeDepart() {
        return longitudeDepart;
    }

    public void setLongitudeDepart(Double longitudeDepart) {
        this.longitudeDepart = longitudeDepart;
    }

    public Double getLatitudeDepart() {
        return latitudeDepart;
    }

    public void setLatitudeDepart(Double latitudeDepart) {
        this.latitudeDepart = latitudeDepart;
    }

    public String getAdressDestination() {
        return adressDestination;
    }

    public void setAdressDestination(String adressDestination) {
        this.adressDestination = adressDestination;
    }

    public Double getLongitudeDestination() {
        return longitudeDestination;
    }

    public void setLongitudeDestination(Double longitudeDestination) {
        this.longitudeDestination = longitudeDestination;
    }

    public Double getLatitudeDestination() {
        return latitudeDestination;
    }

    public void setLatitudeDestination(Double latitudeDestination) {
        this.latitudeDestination = latitudeDestination;
    }

    public LocalDateTime getDateDepart() {
        return dateDepart;
    }

    public void setDateDepart(LocalDateTime dateDepart) {
        this.dateDepart = dateDepart;
    }

    public LocalDateTime getDateArrivee() {
        return dateArrivee;
    }

    public void setDateArrivee(LocalDateTime dateArrivee) {
        this.dateArrivee = dateArrivee;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPoids() {
        return poids;
    }

    public void setPoids(Double poids) {
        this.poids = poids;
    }

    public Double getVolume() {
        return Volume;
    }

    public void setVolume(Double volume) {
        Volume = volume;
    }

    public String getInstructionSpeciales() {
        return InstructionSpeciales;
    }

    public void setInstructionSpeciales(String instructionSpeciales) {
        InstructionSpeciales = instructionSpeciales;
    }
}
