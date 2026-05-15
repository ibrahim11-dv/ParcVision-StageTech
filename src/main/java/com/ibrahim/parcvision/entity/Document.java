package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "document")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;

    /** MIME type: application/pdf, image/png … */
    @Column(name = "type_mime")
    private String typeMime;

    /** File size in bytes */
    private Long taille;

    /** Relative path on disk / S3 key */
    @Column(name = "chemin_stockage")
    private String cheminStockage;

    @Column(name = "date_upload")
    private LocalDateTime dateUpload;

    /** Optional description / notes */
    @Column(length = 1000)
    private String description;

    /** Extracted text via OCR */
    @Column(columnDefinition = "TEXT")
    private String ocrContent;

    // ── Relations ─────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    @JsonBackReference
    private DossierArchivage dossier;

    // ── Constructors ──────────────────────────────────────
    public Document() {}

    // ── Getters / Setters ─────────────────────────────────
    public Long getId()                        { return id; }
    public void setId(Long id)                 { this.id = id; }

    public String getNomFichier()              { return nomFichier; }
    public void setNomFichier(String n)        { this.nomFichier = n; }

    public String getTypeMime()                { return typeMime; }
    public void setTypeMime(String t)          { this.typeMime = t; }

    public Long getTaille()                    { return taille; }
    public void setTaille(Long t)              { this.taille = t; }

    public String getCheminStockage()          { return cheminStockage; }
    public void setCheminStockage(String c)    { this.cheminStockage = c; }

    public LocalDateTime getDateUpload()       { return dateUpload; }
    public void setDateUpload(LocalDateTime d) { this.dateUpload = d; }

    public String getDescription()             { return description; }
    public void setDescription(String d)       { this.description = d; }

    public DossierArchivage getDossier()       { return dossier; }
    public void setDossier(DossierArchivage d) { this.dossier = d; }

    public String getOcrContent()              { return ocrContent; }
    public void setOcrContent(String o)        { this.ocrContent = o; }
}
