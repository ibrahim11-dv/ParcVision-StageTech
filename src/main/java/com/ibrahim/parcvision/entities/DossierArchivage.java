package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class DossierArchivage {
    @Id
    @GeneratedValue
    private Long id;

    private String nom;

    private String chemin;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private DossierArchivage parent;

    @OneToMany(
            mappedBy = "parent"
    )
    @JsonManagedReference
    private List<DossierArchivage> sousDossiers;

    @OneToMany(
            mappedBy = "dossierArchivage"
    )
    @JsonManagedReference
    private List<Document> documents;
}
