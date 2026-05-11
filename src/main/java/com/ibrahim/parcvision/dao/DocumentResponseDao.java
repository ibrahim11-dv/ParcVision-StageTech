package com.ibrahim.parcvision.dao;

import java.time.LocalDateTime;

/**
 * Response DAO for a single document (file).
 */
public class DocumentResponseDao {
    private Long id;
    private String nomFichier;
    private String typeMime;
    private Long taille;
    private String description;
    private LocalDateTime dateUpload;
    private Long dossierId;

    public DocumentResponseDao() {}

    public Long getId()                            { return id; }
    public void setId(Long id)                     { this.id = id; }

    public String getNomFichier()                  { return nomFichier; }
    public void setNomFichier(String n)            { this.nomFichier = n; }

    public String getTypeMime()                    { return typeMime; }
    public void setTypeMime(String t)              { this.typeMime = t; }

    public Long getTaille()                        { return taille; }
    public void setTaille(Long t)                  { this.taille = t; }

    public String getDescription()                 { return description; }
    public void setDescription(String d)           { this.description = d; }

    public LocalDateTime getDateUpload()           { return dateUpload; }
    public void setDateUpload(LocalDateTime dt)    { this.dateUpload = dt; }

    public Long getDossierId()                     { return dossierId; }
    public void setDossierId(Long id)              { this.dossierId = id; }

    private String ocrContent;
    public String getOcrContent()                  { return ocrContent; }
    public void setOcrContent(String o)            { this.ocrContent = o; }
}
