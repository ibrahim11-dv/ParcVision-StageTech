package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ibrahim.parcvision.enums.Role;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilisateur")
public class Utilisateur implements UserDetails {
    @Id
    @GeneratedValue
    private Long id;

    @Column(length = 50, nullable = false)
    private String nom;

    @Column(length = 50, nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true, length = 20) // ou 15 selon vos besoins
    private String telephone;

    @Column(nullable = false)
    private String password; // reste "password" (utilisé par Spring Security)

    // --- Nouveaux champs ajoutés ---
    private String cin;                // Carte d'identité nationale
    private LocalDate dateNaissance;   // Date de naissance

    private String photoProfileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonIgnore
    private Entreprise entreprise;

    @OneToOne(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @JsonIgnore
    private Conducteur conducteur;

    @OneToOne(mappedBy = "utilisateur", fetch = FetchType.LAZY)
    @JsonIgnore

    private Admin admin;

    // Constructeurs
    public Utilisateur() {}

    // Getters / Setters (ceux existants)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    // ⚠️ Important : getPassword() est déjà hérité de UserDetails, le setter s'appelle setPassword
    @Override
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    // Nouveaux getters/setters
    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public LocalDate getDateNaissance() { return dateNaissance; }
    public void setDateNaissance(LocalDate dateNaissance) { this.dateNaissance = dateNaissance; }

    public String getPhotoProfileUrl() { return photoProfileUrl; }
    public void setPhotoProfileUrl(String photoProfileUrl) { this.photoProfileUrl = photoProfileUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }

    public Conducteur getConducteur() { return conducteur; }
    public void setConducteur(Conducteur conducteur) { this.conducteur = conducteur; }

    public Admin getAdmin() { return admin; }
    public void setAdmin(Admin admin) { this.admin = admin; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override
    public String getUsername() { return email; }

    // Le constructeur complet déjà existant – je le laisse, mais je l'adapte sans dateNaissance/cin pour ne pas casser
    // Vous pouvez l'enrichir plus tard selon vos besoins.
    public Utilisateur(Long id, String nom, String prenom, String email, String telephone, String password,
                       String photoProfileUrl, Role role, Entreprise entreprise, Conducteur conducteur, Admin admin) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.password = password;
        this.photoProfileUrl = photoProfileUrl;
        this.role = role;
        this.entreprise = entreprise;
        this.conducteur = conducteur;
        this.admin = admin;
    }
}