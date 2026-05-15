package com.ibrahim.parcvision.dao;

/**
 * Data Access Object for search suggestions in Archivage.
 */
public class SearchSuggestionDao {
    private Long id;
    private String type;      // "FILE" or "FOLDER"
    private String name;
    private String matchType; // "NAME" or "CONTENT"
    private String context;   // Snippet of text if matchType is CONTENT
    private Long dossierId;   // ID of the dossier to navigate to
    private String dossierNom;
    private String chemin;

    public SearchSuggestionDao() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getMatchType() { return matchType; }
    public void setMatchType(String matchType) { this.matchType = matchType; }

    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }

    public Long getDossierId() { return dossierId; }
    public void setDossierId(Long dossierId) { this.dossierId = dossierId; }

    public String getDossierNom() { return dossierNom; }
    public void setDossierNom(String dossierNom) { this.dossierNom = dossierNom; }

    public String getChemin() { return chemin; }
    public void setChemin(String chemin) { this.chemin = chemin; }
}
