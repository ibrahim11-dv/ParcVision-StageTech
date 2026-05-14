package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
    private Long id;

    @Column(name = "numero_permis", length = 30, unique = true, nullable = false)
    private String numeroPermis;

    @Column(name = "date_validite_permis", nullable = false)
    private LocalDate dateValiditePermis;

    @Column(name = "photo_profile_url")
    private String photoProfileUrl;

    // --- Nouveaux champs ajoutés ---
    private LocalDate dateEmbauche;          // Date d'embauche
    private String scanCinUrl;               // URL du scan de la CIN
    private String scanPermisUrl;            // URL du scan du permis

    @Enumerated(EnumType.STRING)
    private Statut statut;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;

    @OneToMany(mappedBy = "conducteur")
    @JsonIgnore
    private List<Mission> mission;

    @OneToOne(mappedBy = "conducteur", fetch = FetchType.LAZY)
    @JsonIgnore
    private Document document;

    // Constructeurs
    public Conducteur() {}

    // Getters / Setters (existants)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNumeroPermis() { return numeroPermis; }
    public void setNumeroPermis(String numeroPermis) { this.numeroPermis = numeroPermis; }

    public LocalDate getDateValiditePermis() { return dateValiditePermis; }
    public void setDateValiditePermis(LocalDate dateValiditePermis) { this.dateValiditePermis = dateValiditePermis; }

    public String getPhotoProfileUrl() { return photoProfileUrl; }
    public void setPhotoProfileUrl(String photoProfileUrl) { this.photoProfileUrl = photoProfileUrl; }

    // Nouveaux getters/setters
    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDate dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public String getScanCinUrl() { return scanCinUrl; }
    public void setScanCinUrl(String scanCinUrl) { this.scanCinUrl = scanCinUrl; }

    public String getScanPermisUrl() { return scanPermisUrl; }
    public void setScanPermisUrl(String scanPermisUrl) { this.scanPermisUrl = scanPermisUrl; }

    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }

    public List<Mission> getMission() { return mission; }
    public void setMission(List<Mission> mission) { this.mission = mission; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
}