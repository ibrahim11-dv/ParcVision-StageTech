package com.ibrahim.parcvision.dao;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ProfileMinimalInfoDao {

    @Email
    private String email;

    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }
}
