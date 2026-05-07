package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ibrahim.parcvision.enums.TypeColis;
import jakarta.persistence.*;

@Entity
public class Colis {
    @Id
    @GeneratedValue()
    private Long id;

    private String description;
    private Double poids;
    private Double volume;
    @Column(name = "code_suivi")
    private String codeSuivi;
    @Column(name = "est_livre")
    private boolean estLivre;
    private TypeColis type;

    @ManyToOne()
    @JoinColumn( name = "mission_id")
    @JsonIgnore
    private Mission mission;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPoids() {
        return poids;
    }

    public void setPoids(Double poids) {
        this.poids = poids;
    }

    public Double getVolume() {
        return volume;
    }

    public void setVolume(Double volume) {
        this.volume = volume;
    }

    public String getCodeSuivi() {
        return codeSuivi;
    }

    public void setCodeSuivi(String codeSuivi) {
        this.codeSuivi = codeSuivi;
    }

    public boolean isEstLivre() {
        return estLivre;
    }

    public void setEstLivre(boolean estLivre) {
        this.estLivre = estLivre;
    }

    public TypeColis getType() {
        return type;
    }

    public void setType(TypeColis type) {
        this.type = type;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }
}
