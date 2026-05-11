package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dossier_archivage")
public class DossierArchivage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    /**
     * Full computed path for display: e.g. "/Véhicules/Ford Transit"
     * Stored for fast breadcrumb rebuilding.
     */
    @Column(length = 1000)
    private String chemin;

    // ── Self-referential parent/children ─────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonBackReference("dossier-parent")
    private DossierArchivage parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("dossier-parent")
    private List<DossierArchivage> sousDossiers = new ArrayList<>();

    // ── Files inside this folder ─────────────────────────
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Document> documents = new ArrayList<>();

    // ── Scoped to an enterprise ───────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonBackReference("dossier-entreprise")
    private Entreprise entreprise;

    // ── Constructors ──────────────────────────────────────
    public DossierArchivage() {}

    public DossierArchivage(String nom, String chemin, DossierArchivage parent, Entreprise entreprise) {
        this.nom       = nom;
        this.chemin    = chemin;
        this.parent    = parent;
        this.entreprise = entreprise;
    }

    // ── Getters / Setters ─────────────────────────────────
    public Long getId()                           { return id; }
    public void setId(Long id)                    { this.id = id; }

    public String getNom()                        { return nom; }
    public void setNom(String nom)                { this.nom = nom; }

    public String getChemin()                     { return chemin; }
    public void setChemin(String chemin)          { this.chemin = chemin; }

    public DossierArchivage getParent()           { return parent; }
    public void setParent(DossierArchivage p)     { this.parent = p; }

    public List<DossierArchivage> getSousDossiers() { return sousDossiers; }
    public void setSousDossiers(List<DossierArchivage> s) { this.sousDossiers = s; }

    public List<Document> getDocuments()          { return documents; }
    public void setDocuments(List<Document> d)    { this.documents = d; }

    public Entreprise getEntreprise()             { return entreprise; }
    public void setEntreprise(Entreprise e)       { this.entreprise = e; }
}
