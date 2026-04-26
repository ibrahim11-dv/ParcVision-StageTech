package com.ibrahim.parcvision.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @ManyToOne
    @JoinColumn(
            name = "mission_id"
    )
    @JsonBackReference
    private Mission mission;


}
