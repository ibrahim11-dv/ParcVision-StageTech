package com.ibrahim.parcvision.entity;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumeroPermis() {
        return numeroPermis;
    }

    public void setNumeroPermis(String numeroPermis) {
        this.numeroPermis = numeroPermis;
    }

    public LocalDate getDateValiditePermis() {
        return dateValiditePermis;
    }

    public void setDateValiditePermis(LocalDate dateValiditePermis) {
        this.dateValiditePermis = dateValiditePermis;
    }

    public String getPhotoProfileUrl() {
        return photoProfileUrl;
    }

    public void setPhotoProfileUrl(String photoProfileUrl) {
        this.photoProfileUrl = photoProfileUrl;
    }

    public Statut getStatut() {
        return statut;
    }

    public void setStatut(Statut statut) {
        this.statut = statut;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public List<Mission> getMission() {
        return mission;
    }

    public void setMission(List<Mission> mission) {
        this.mission = mission;
    }

    public Entreprise getEntreprise() {
        return (utilisateur != null) ? utilisateur.getEntreprise() : null;
    }
}
