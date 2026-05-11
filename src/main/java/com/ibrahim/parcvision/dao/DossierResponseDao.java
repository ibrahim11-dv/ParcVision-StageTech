package com.ibrahim.parcvision.dao;

/**
 * Response DAO for a folder node — used for both tree and grid rendering.
 */
public class DossierResponseDao {
    private Long id;
    private String nom;
    private String chemin;
    private Long parentId;
    private int nombreSousDossiers;
    private int nombreDocuments;

    public DossierResponseDao() {}

    public Long getId()                         { return id; }
    public void setId(Long id)                  { this.id = id; }

    public String getNom()                      { return nom; }
    public void setNom(String nom)              { this.nom = nom; }

    public String getChemin()                   { return chemin; }
    public void setChemin(String chemin)        { this.chemin = chemin; }

    public Long getParentId()                   { return parentId; }
    public void setParentId(Long parentId)      { this.parentId = parentId; }

    public int getNombreSousDossiers()          { return nombreSousDossiers; }
    public void setNombreSousDossiers(int n)    { this.nombreSousDossiers = n; }

    public int getNombreDocuments()             { return nombreDocuments; }
    public void setNombreDocuments(int n)       { this.nombreDocuments = n; }
}
