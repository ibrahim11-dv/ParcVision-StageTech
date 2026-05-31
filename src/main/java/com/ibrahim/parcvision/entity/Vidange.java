package com.ibrahim.parcvision.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import java.time.LocalDate;

@Entity
@DiscriminatorValue("vidange")
public class Vidange extends Intervention {

    @Column(name = "type_huile")
    private String typeHuile;

    private String viscosite;

    @Column(name = "filter_huile_change")
    private boolean filterHuileChange;

    @Column(name = "filter_air_change")
    private boolean filterAirChange;

    @Column(name = "filter_carburant_change")
    private boolean filterCarburantChange;

    @Column(name = "est_paye")
    private Boolean estPaye = false;

    @Column(name = "date_payement")
    private LocalDate datePayement;

    // Getters and Setters
    public String getTypeHuile() { return typeHuile; }
    public void setTypeHuile(String typeHuile) { this.typeHuile = typeHuile; }

    public String getViscosite() { return viscosite; }
    public void setViscosite(String viscosite) { this.viscosite = viscosite; }

    public boolean isFilterHuileChange() { return filterHuileChange; }
    public void setFilterHuileChange(boolean filterHuileChange) { this.filterHuileChange = filterHuileChange; }

    public boolean isFilterAirChange() { return filterAirChange; }
    public void setFilterAirChange(boolean filterAirChange) { this.filterAirChange = filterAirChange; }

    public boolean isFilterCarburantChange() { return filterCarburantChange; }
    public void setFilterCarburantChange(boolean filterCarburantChange) { this.filterCarburantChange = filterCarburantChange; }

    public Boolean getEstPaye() { return estPaye; }
    public void setEstPaye(Boolean estPaye) { this.estPaye = estPaye; }

    public LocalDate getDatePayement() { return datePayement; }
    public void setDatePayement(LocalDate datePayement) { this.datePayement = datePayement; }
}
