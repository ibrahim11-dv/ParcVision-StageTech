package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "admin")
public class Admin {

    @Id
    @GeneratedValue
    private Long id;

    @OneToOne
    @JoinColumn(
            name = "utilisateur_id",
            nullable = false
    )
    @JsonBackReference
    private Utilisateur utilisateur;

    public Admin(Utilisateur utilisateur, Long id) {
        this.utilisateur = utilisateur;
        this.id = id;
    }

    public Admin() {

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }
}
