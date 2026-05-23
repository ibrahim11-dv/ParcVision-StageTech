package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("accident")
public class Accident extends Intervention {

    @Column(name = "lieu")
    private String lieu;

    @Column(name = "contexte", columnDefinition = "TEXT")
    private String contexte;

    @Column(name = "gravite")
    private String gravite;

    @Column(name = "budget_estime")
    private double budgetEstime;

    @Column(name = "etat")
    private String etat;

    @ManyToOne
    @JoinColumn(name = "conducteur_id")
    @JsonIgnoreProperties({"accidents", "mission", "document"})
    private Conducteur conducteur;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "accident_photos", joinColumns = @JoinColumn(name = "accident_id"))
    @Column(name = "photo_url")
    private List<String> photosUrl = new ArrayList<>();

    // Getters and Setters
    public String getLieu() { return lieu; }
    public void setLieu(String lieu) { this.lieu = lieu; }

    public String getContexte() { return contexte; }
    public void setContexte(String contexte) { this.contexte = contexte; }

    public String getGravite() { return gravite; }
    public void setGravite(String gravite) { this.gravite = gravite; }

    public double getBudgetEstime() { return budgetEstime; }
    public void setBudgetEstime(double budgetEstime) { this.budgetEstime = budgetEstime; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }

    public Conducteur getConducteur() { return conducteur; }
    public void setConducteur(Conducteur conducteur) { this.conducteur = conducteur; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getPhotosUrl() { return photosUrl; }
    public void setPhotosUrl(List<String> photosUrl) { this.photosUrl = photosUrl; }
}