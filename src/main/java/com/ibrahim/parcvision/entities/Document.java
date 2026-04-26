package com.ibrahim.parcvision.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class Document {
    @Id
    @GeneratedValue
    private Long id;

    private String nomFichier;

    private String type;

    private Long taille;

    private String cheminStockage;

    private LocalDateTime dateUpload;

}
