package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "fournisseur")
public class Fournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fournisseur")
    private Long idFournisseur;

    @Column(name = "type_fournisseur", nullable = false)
    private String typeFournisseur; // Fournisseur, Garage, Station de Gazoil

    @Column(name = "nom_fournisseur", nullable = false)
    private String nomFournisseur;

    @Column(name = "ville")
    private String ville;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "telephone")
    private String telephone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonIgnore
    private Entreprise entreprise;

    // Constructeurs
    public Fournisseur() {}

    public Fournisseur(Long idFournisseur, String typeFournisseur, String nomFournisseur, String ville, String adresse, String telephone, Entreprise entreprise) {
        this.idFournisseur = idFournisseur;
        this.typeFournisseur = typeFournisseur;
        this.nomFournisseur = nomFournisseur;
        this.ville = ville;
        this.adresse = adresse;
        this.telephone = telephone;
        this.entreprise = entreprise;
    }

    // Getters / Setters
    public Long getIdFournisseur() { return idFournisseur; }
    public void setIdFournisseur(Long idFournisseur) { this.idFournisseur = idFournisseur; }

    public String getTypeFournisseur() { return typeFournisseur; }
    public void setTypeFournisseur(String typeFournisseur) { this.typeFournisseur = typeFournisseur; }

    public String getNomFournisseur() { return nomFournisseur; }
    public void setNomFournisseur(String nomFournisseur) { this.nomFournisseur = nomFournisseur; }

    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }

    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }
}
