package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "entreprise")
public class Entreprise {
    @Id
    @GeneratedValue
    private Long  id;

    @Column(
            unique = true,
            nullable = false
    )
    private String nom;
    @Column(
            unique = true
    )
    private String adresse;
    @Column(
            unique = true,
            nullable = false
    )
    private String telephone;
    @Column(
            unique = true,
            nullable = false
    )
    private String email;
    @Column(
            name = "secteur_activite"
    )
    private String secteurActivite;
    @Column(
            name = "date_creation"
    )
    private LocalDate dateCreation;

    @OneToMany(
            mappedBy = "entreprise"
    )
    @JsonManagedReference
    private List<Utilisateur> utilisateur;

    @OneToMany(
            mappedBy = "entreprise"
    )
    @JsonManagedReference
    private List<Vehicule> vehicule;

    @OneToMany(
            mappedBy = "entreprise"
    )
    @JsonManagedReference
    private List<Mission> mission;


    @OneToOne(
            mappedBy = "entreprise"
    )
    @JsonManagedReference
    private Document document;

    public Entreprise(Long id, String nom, String adresse, String telephone, String email, String secteurActivite, LocalDate dateCreation, List<Utilisateur> utilisateur, List<Vehicule> vehicule, List<Mission> mission, Document document) {
        this.id = id;
        this.nom = nom;
        this.adresse = adresse;
        this.telephone = telephone;
        this.email = email;
        this.secteurActivite = secteurActivite;
        this.dateCreation = dateCreation;
        this.utilisateur = utilisateur;
        this.vehicule = vehicule;
        this.mission = mission;
        this.document = document;
    }

    public Entreprise() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSecteurActivite() {
        return secteurActivite;
    }

    public void setSecteurActivite(String secteurActivite) {
        this.secteurActivite = secteurActivite;
    }

    public LocalDate getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDate dateCreation) {
        this.dateCreation = dateCreation;
    }

    public List<Utilisateur> getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(List<Utilisateur> utilisateur) {
        this.utilisateur = utilisateur;
    }

    public List<Vehicule> getVehicule() {
        return vehicule;
    }

    public void setVehicule(List<Vehicule> vehicule) {
        this.vehicule = vehicule;
    }

    public List<Mission> getMission() {
        return mission;
    }

    public void setMission(List<Mission> mission) {
        this.mission = mission;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
