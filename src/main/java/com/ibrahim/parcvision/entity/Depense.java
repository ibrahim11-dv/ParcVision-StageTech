package com.ibrahim.parcvision.entity;

import com.ibrahim.parcvision.enums.TypePaiement;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "depense")
public class Depense {

    @Id
    @GeneratedValue
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_paiement")
    private TypePaiement typePaiement;

    @Column(name = "qui")
    private String qui;

    @Column(name = "montant")
    private double montant;

    @Column(name = "source_depense")
    private String sourceDepense;

    @Column(name = "source_depense_custom")
    private String sourceDepenseCustom;

    @Column(name = "date_depense")
    private LocalDate dateDepense;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entreprise_id", nullable = false)
    @JsonIgnoreProperties({"utilisateur", "utilisateurs", "vehicule", "vehicules", "mission", "missions", "dossiersArchivage", "hibernateLazyInitializer", "handler"})
    private Entreprise entreprise;

    @Column(name = "est_payee")
    private Boolean estPayee = false;

    // Getters and Setters
    public boolean isEstPayee() { return estPayee != null && estPayee; }
    public Boolean getEstPayee() { return estPayee; }
    public void setEstPayee(Boolean estPayee) { this.estPayee = estPayee; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TypePaiement getTypePaiement() { return typePaiement; }
    public void setTypePaiement(TypePaiement typePaiement) { this.typePaiement = typePaiement; }

    public String getQui() { return qui; }
    public void setQui(String qui) { this.qui = qui; }

    public double getMontant() { return montant; }
    public void setMontant(double montant) { this.montant = montant; }

    public String getSourceDepense() { return sourceDepense; }
    public void setSourceDepense(String sourceDepense) { this.sourceDepense = sourceDepense; }

    public String getSourceDepenseCustom() { return sourceDepenseCustom; }
    public void setSourceDepenseCustom(String sourceDepenseCustom) { this.sourceDepenseCustom = sourceDepenseCustom; }

    public LocalDate getDateDepense() { return dateDepense; }
    public void setDateDepense(LocalDate dateDepense) { this.dateDepense = dateDepense; }

    public Entreprise getEntreprise() { return entreprise; }
    public void setEntreprise(Entreprise entreprise) { this.entreprise = entreprise; }
}
