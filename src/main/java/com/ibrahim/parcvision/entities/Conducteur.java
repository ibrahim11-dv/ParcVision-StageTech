package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ibrahim.parcvision.enums.Statut;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "conducteur")
public class Conducteur {
    @Id
    @GeneratedValue
    private Long  id;
    @Column(
            name = "numero_permis",
            length = 30,
            unique = true,
            nullable = false
    )
    private String numeroPermis;
    @Column(
            name = "date_validite_permis",
            nullable = false
    )
    private LocalDate dateValiditePermis;
    @Column(
            name = "photo_profile_url"
    )
    private String photoProfileUrl;

    @Enumerated(EnumType.STRING)
    private Statut statut;

    @OneToOne
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false
    )
    @JsonBackReference
    private Utilisateur utilisateur;

    @OneToMany(
            mappedBy = "conducteur"
    )
    @JsonManagedReference
    private List<Mission> mission;

    @OneToOne(
            mappedBy = "conducteur"
    )
    @JsonManagedReference
    private Document document;

}
