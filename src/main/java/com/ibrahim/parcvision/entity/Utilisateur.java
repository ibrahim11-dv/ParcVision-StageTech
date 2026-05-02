package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.ibrahim.parcvision.enums.Role;
import jakarta.persistence.*;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "utilisateur")
public class Utilisateur implements UserDetails {
    @Id
    @GeneratedValue
    private Long  id;
    @Column(
            length = 50,
            nullable = false
    )
    private String nom;
    @Column(
            length = 50,
            nullable = false
    )
    private String prenom;
    @Column(
            nullable = false,
            unique = true
    )

    private String email;
    @Column(
            nullable = false,
            unique = true,
            length = 10
    )

    private String telephone;
    @Column(
            nullable = false
    )

    private String password;
    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false
    )
    private Role role;

    @ManyToOne
    @JoinColumn(
            name ="entreprise_id",
            nullable = false
    )
    @JsonBackReference
    private Entreprise entreprise;

    @OneToOne(
            mappedBy = "utilisateur"
    )
    @JsonManagedReference
    private Conducteur conducteur;

    @OneToOne(
            mappedBy = "utilisateur"
    )
    @JsonManagedReference
    private Admin admin;



    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
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

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Entreprise getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(Entreprise entreprise) {
        this.entreprise = entreprise;
    }

    public Conducteur getConducteur() {
        return conducteur;
    }

    public void setConducteur(Conducteur conducteur) {
        this.conducteur = conducteur;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public Utilisateur(Long id, String nom, String prenom, String email, String telephone, String password, Role role, Entreprise entreprise, Conducteur conducteur, Admin admin) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.password = password;
        this.role = role;
        this.entreprise = entreprise;
        this.conducteur = conducteur;
        this.admin = admin;
    }
    public Utilisateur() {
    }
}
