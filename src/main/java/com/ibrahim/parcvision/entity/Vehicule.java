package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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

    @Column(
            nullable = false
    )
    private String marque;
    @Column(
            nullable = false
    )
    private String model;
    @Column(
            name = "kilometrage_actuel"
    )
    private Long KilometrageActuel;
    @Column(
            name = "date_mise_Circulation"
    )
    private LocalDate dateMiseCirculation;
    @Column(
            name = "capacite_charge_kg",
            nullable = false

    )
    private Long capaciteChargeKg;
    @Column(
            unique = true,
            nullable = false
    )
    private String immatriculation;
    @Column(
            name ="type_vehicule"
    )
    @Enumerated(EnumType.STRING)
    private TypeVehicule typeVehicule;
    @Column(
            name ="statut_vehicule"
    )
    @Enumerated(EnumType.STRING)
    private StatutVehicule statutVehicule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "entreprise_id",
            nullable = false
    )
    @JsonBackReference
    private Entreprise entreprise;

    @OneToMany(
            mappedBy = "vehicule"
    )
    @JsonManagedReference
    private List<Mission> mission;

    @OneToMany(
            mappedBy = "vehicule"
    )
    @JsonManagedReference
    private List<Intervention> intervention;

    @OneToOne(fetch = FetchType.LAZY,
            mappedBy = "vehicule"
    )
    @JsonManagedReference
    private Document document;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Long getKilometrageActuel() {
        return KilometrageActuel;
    }

    public void setKilometrageActuel(Long kilometrageActuel) {
        KilometrageActuel = kilometrageActuel;
    }

    public LocalDate getDateMiseCirculation() {
        return dateMiseCirculation;
    }

    public void setDateMiseCirculation(LocalDate dateMiseCirculation) {
        this.dateMiseCirculation = dateMiseCirculation;
    }

    public Long getCapaciteChargeKg() {
        return capaciteChargeKg;
    }

    public void setCapaciteChargeKg(Long capaciteChargeKg) {
        this.capaciteChargeKg = capaciteChargeKg;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public TypeVehicule getTypeVehicule() {
        return typeVehicule;
    }

    public void setTypeVehicule(TypeVehicule typeVehicule) {
        this.typeVehicule = typeVehicule;
    }

    public StatutVehicule getStatutVehicule() {
        return statutVehicule;
    }

    public void setStatutVehicule(StatutVehicule statutVehicule) {
        this.statutVehicule = statutVehicule;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }

    public List<Mission> getMission() {
        return mission;
    }

    public void setMission(List<Mission> mission) {
        this.mission = mission;
    }

    public List<Intervention> getIntervention() {
        return intervention;
    }

    public void setIntervention(List<Intervention> intervention) {
        this.intervention = intervention;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
