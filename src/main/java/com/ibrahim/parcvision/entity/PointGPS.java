package com.ibrahim.parcvision.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.ibrahim.parcvision.enums.TypePoint;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
public class PointGPS {
    @Id
    @GeneratedValue
    private Long id;

    private double altitude ;

    private double longitude;

    private LocalDate timeStamp;

    private double vitesse;

    private double precision;

    @Column(
            name = "type_point",
            nullable = false
    )
    private TypePoint typePoint;
    @ManyToOne
    @JoinColumn(
            name = "mission_id"
    )
    @JsonBackReference
    private Mission mission;


}
