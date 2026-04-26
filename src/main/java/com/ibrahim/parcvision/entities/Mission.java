package com.ibrahim.parcvision.entities;

import com.ibrahim.parcvision.enums.StatutMission;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDate;

@Entity
public class Mission {
    @Id
    private Long id;

    private LocalDate dataDebut;
    private LocalDate dateFinEstimee;
    private LocalDate dateFinReelle;
    private String adresseDepart;
    private String adressArrivee;
    private String instructionsSpeciales;
    private String reference;

    private StatutMission statut;
    private String preuveLivraisonUrl;


}
