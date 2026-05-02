package com.ibrahim.parcvision.dao;

import jakarta.persistence.Entity;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class RegistrationRequestDao {
    @NotBlank
    @Size(min = 2, max = 50)
    private String entrepriseNom;
    @Email
    @NotBlank
    private String entrepriseEmail;
    @NotBlank
    private String entrepriseSecteurActivite;
    @NotNull
    private LocalDate entrepriseDateCreation;
    @NotBlank
    private String entrepriseAdresse;
    @NotBlank
    private String entrepriseTelephone;


    @NotBlank
    @Size(min = 2, max = 50)
    private String adminPrenom ;
    @NotBlank
    @Size(min = 2, max = 50)
    private String adminNom ;
    @NotBlank
    private String adminEmail ;
    @NotBlank
    private String adminPassword ;


    public String getEntrepriseTelephone() {
        return entrepriseTelephone;
    }

    public void setEntrepriseTelephone(String entrepriseTelephone) {
        this.entrepriseTelephone = entrepriseTelephone;
    }
    public String getEntrepriseNom() {
        return entrepriseNom;
    }

    public void setEntrepriseNom(String entrepriseNom) {
        this.entrepriseNom = entrepriseNom;
    }

    public String getEntrepriseEmail() {
        return entrepriseEmail;
    }

    public void setEntrepriseEmail(String entrepriseEmail) {
        this.entrepriseEmail = entrepriseEmail;
    }

    public String getEntrepriseSecteurActivite() {
        return entrepriseSecteurActivite;
    }

    public void setEntrepriseSecteurActivite(String entrepriseSecteurActivite) {
        this.entrepriseSecteurActivite = entrepriseSecteurActivite;
    }

    public LocalDate getEntrepriseDateCreation() {
        return entrepriseDateCreation;
    }

    public void setEntrepriseDateCreation(LocalDate entrepriseDateCreation) {
        this.entrepriseDateCreation = entrepriseDateCreation;
    }

    public String getEntrepriseAdresse() {
        return entrepriseAdresse;
    }

    public void setEntrepriseAdresse(String entrepriseAdresse) {
        this.entrepriseAdresse = entrepriseAdresse;
    }

    public String getAdminPrenom() {
        return adminPrenom;
    }

    public void setAdminPrenom(String adminPrenom) {
        this.adminPrenom = adminPrenom;
    }

    public String getAdminNom() {
        return adminNom;
    }

    public void setAdminNom(String adminNom) {
        this.adminNom = adminNom;
    }

    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(String adminEmail) {
        this.adminEmail = adminEmail;
    }

    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(String adminPassword) {
        this.adminPassword = adminPassword;
    }
}
