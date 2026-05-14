package com.ibrahim.parcvision.dao;

import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;

public class ConducteurRequestDao {
    // Infos Utilisateur
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String email;
    private String telephone;
    private String cin;

    // Infos Conducteur
    private String numeroPermis;
    private LocalDate dateValiditePermis;
    private String statut; // "DISPONIBLE", "EN_MISSION", etc.

    // Dates & mot de passe
    private LocalDate dateEmbauche;
    private String motDePasse;

    // Fichiers
    private MultipartFile photoProfile;
    private MultipartFile scanCin;
    private MultipartFile scanPermis;

    // --- Getters / Setters ---
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getNumeroPermis() { return numeroPermis; }
    public void setNumeroPermis(String numeroPermis) { this.numeroPermis = numeroPermis; }

    public LocalDate getDateValiditePermis() { return dateValiditePermis; }
    public void setDateValiditePermis(LocalDate dateValiditePermis) { this.dateValiditePermis = dateValiditePermis; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDate getDateEmbauche() { return dateEmbauche; }
    public void setDateEmbauche(LocalDate dateEmbauche) { this.dateEmbauche = dateEmbauche; }

    public String getMotDePasse() { return motDePasse; }
    public void setMotDePasse(String motDePasse) { this.motDePasse = motDePasse; }

    public MultipartFile getPhotoProfile() { return photoProfile; }
    public void setPhotoProfile(MultipartFile photoProfile) { this.photoProfile = photoProfile; }

    public MultipartFile getScanCin() { return scanCin; }
    public void setScanCin(MultipartFile scanCin) { this.scanCin = scanCin; }

    public MultipartFile getScanPermis() { return scanPermis; }
    public void setScanPermis(MultipartFile scanPermis) { this.scanPermis = scanPermis; }
}