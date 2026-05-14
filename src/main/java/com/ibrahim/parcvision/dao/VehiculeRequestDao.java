package com.ibrahim.parcvision.dao;

import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public class VehiculeRequestDao {
    private String immatriculation;
    private String marque;
    private String model;
    private Long kilometrageActuel;
    private Long capaciteChargeKg;
    private String carburant;
    private LocalDate dateExpirationAssurance;
    private LocalDate dateProchainControleTechnique;
    private LocalDate dateMiseCirculation;
    private String typeVehicule;       // nom de l'enum TypeVehicule
    private String statutVehicule;     // nom de l'enum StatutVehicule

    // Fichiers
    private List<MultipartFile> imagesVehicule;   // multiple photos
    private MultipartFile scanCarteGrise;
    private MultipartFile scanAssurance;

    // Getters et setters
    public String getImmatriculation() { return immatriculation; }
    public void setImmatriculation(String immatriculation) { this.immatriculation = immatriculation; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Long getKilometrageActuel() { return kilometrageActuel; }
    public void setKilometrageActuel(Long kilometrageActuel) { this.kilometrageActuel = kilometrageActuel; }

    public Long getCapaciteChargeKg() { return capaciteChargeKg; }
    public void setCapaciteChargeKg(Long capaciteChargeKg) { this.capaciteChargeKg = capaciteChargeKg; }

    public String getCarburant() { return carburant; }
    public void setCarburant(String carburant) { this.carburant = carburant; }

    public LocalDate getDateExpirationAssurance() { return dateExpirationAssurance; }
    public void setDateExpirationAssurance(LocalDate dateExpirationAssurance) { this.dateExpirationAssurance = dateExpirationAssurance; }

    public LocalDate getDateProchainControleTechnique() { return dateProchainControleTechnique; }
    public void setDateProchainControleTechnique(LocalDate dateProchainControleTechnique) { this.dateProchainControleTechnique = dateProchainControleTechnique; }

    public LocalDate getDateMiseCirculation() { return dateMiseCirculation; }
    public void setDateMiseCirculation(LocalDate dateMiseCirculation) { this.dateMiseCirculation = dateMiseCirculation; }

    public String getTypeVehicule() { return typeVehicule; }
    public void setTypeVehicule(String typeVehicule) { this.typeVehicule = typeVehicule; }

    public String getStatutVehicule() { return statutVehicule; }
    public void setStatutVehicule(String statutVehicule) { this.statutVehicule = statutVehicule; }

    public List<MultipartFile> getImagesVehicule() { return imagesVehicule; }
    public void setImagesVehicule(List<MultipartFile> imagesVehicule) { this.imagesVehicule = imagesVehicule; }

    public MultipartFile getScanCarteGrise() { return scanCarteGrise; }
    public void setScanCarteGrise(MultipartFile scanCarteGrise) { this.scanCarteGrise = scanCarteGrise; }

    public MultipartFile getScanAssurance() { return scanAssurance; }
    public void setScanAssurance(MultipartFile scanAssurance) { this.scanAssurance = scanAssurance; }
}