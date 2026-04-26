package com.ibrahim.parcvision.entities;

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

    @ManyToOne
    @JoinColumn(
            name = "entreprise_id"
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
}
