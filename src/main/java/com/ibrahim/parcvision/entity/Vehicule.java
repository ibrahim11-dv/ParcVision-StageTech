package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ibrahim.parcvision.enums.StatutVehicule;
import com.ibrahim.parcvision.enums.TypeVehicule;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
public class Vehicule {
    @Id
    @GeneratedValue
    private Long id;

    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String model;

    @Column(name = "kilometrage_actuel")
    private Long kilometrageActuel;

    @Column(name = "date_mise_circulation")
    private LocalDate dateMiseCirculation;

    @Column(name = "capacite_charge_kg", nullable = false)
    private Long capaciteChargeKg;

    @Column(unique = true, nullable = false)
    private String immatriculation;

    private String carburant;

    @Column(name = "date_expiration_assurance")
    private LocalDate dateExpirationAssurance;

    @Column(name = "date_prochain_controle_technique")
    private LocalDate dateProchainControleTechnique;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_vehicule")
    private TypeVehicule typeVehicule;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_vehicule")
    private StatutVehicule statutVehicule;

    // URLs des images multiples, stockées sous forme de chaîne séparée par des virgules
    @Column(columnDefinition = "TEXT")
    private String imagesUrls;

    // Documents administratifs
    @Column(name = "scan_carte_grise_url")
    private String scanCarteGriseUrl;

    @Column(name = "scan_assurance_url")
    private String scanAssuranceUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonIgnore
    private Entreprise entreprise;

    @OneToMany(mappedBy = "vehicule", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Mission> mission;

    @OneToMany(mappedBy = "vehicule", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Intervention> intervention;

    @OneToOne(mappedBy = "vehicule", fetch = FetchType.LAZY)
    @JsonIgnore
    private Document document;

    // Constructeurs
    public Vehicule() {}

    // Getters et setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Long getKilometrageActuel() { return kilometrageActuel; }
    public void setKilometrageActuel(Long kilometrageActuel) { this.kilometrageActuel = kilometrageActuel; }

    public LocalDate getDateMiseCirculation() { return dateMiseCirculation; }
    public void setDateMiseCirculation(LocalDate dateMiseCirculation) { this.dateMiseCirculation = dateMiseCirculation; }

    public Long getCapaciteChargeKg() { return capaciteChargeKg; }
    public void setCapaciteChargeKg(Long capaciteChargeKg) { this.capaciteChargeKg = capaciteChargeKg; }

    public String getImmatriculation() { return immatriculation; }
    public void setImmatriculation(String immatriculation) { this.immatriculation = immatriculation; }

    public String getCarburant() { return carburant; }
    public void setCarburant(String carburant) { this.carburant = carburant; }

    public LocalDate getDateExpirationAssurance() { return dateExpirationAssurance; }
    public void setDateExpirationAssurance(LocalDate dateExpirationAssurance) { this.dateExpirationAssurance = dateExpirationAssurance; }

    public LocalDate getDateProchainControleTechnique() { return dateProchainControleTechnique; }
    public void setDateProchainControleTechnique(LocalDate dateProchainControleTechnique) { this.dateProchainControleTechnique = dateProchainControleTechnique; }

    public TypeVehicule getTypeVehicule() { return typeVehicule; }
    public void setTypeVehicule(TypeVehicule typeVehicule) { this.typeVehicule = typeVehicule; }

    public StatutVehicule getStatutVehicule() { return statutVehicule; }
    public void setStatutVehicule(StatutVehicule statutVehicule) { this.statutVehicule = statutVehicule; }

    public String getImagesUrls() { return imagesUrls; }
    public void setImagesUrls(String imagesUrls) { this.imagesUrls = imagesUrls; }

    public String getScanCarteGriseUrl() { return scanCarteGriseUrl; }
    public void setScanCarteGriseUrl(String scanCarteGriseUrl) { this.scanCarteGriseUrl = scanCarteGriseUrl; }

    public String getScanAssuranceUrl() { return scanAssuranceUrl; }
    public void setScanAssuranceUrl(String scanAssuranceUrl) { this.scanAssuranceUrl = scanAssuranceUrl; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public List<Mission> getMission() { return mission; }
    public void setMission(List<Mission> mission) { this.mission = mission; }

    public List<Intervention> getIntervention() { return intervention; }
    public void setIntervention(List<Intervention> intervention) { this.intervention = intervention; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
}
