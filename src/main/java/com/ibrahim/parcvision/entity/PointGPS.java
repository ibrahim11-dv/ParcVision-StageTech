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

    private double laltitude ;

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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getLaltitude() {
        return laltitude;
    }

    public void setLaltitude(double laltitude) {
        this.laltitude = laltitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public LocalDate getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(LocalDate timeStamp) {
        this.timeStamp = timeStamp;
    }

    public double getVitesse() {
        return vitesse;
    }

    public void setVitesse(double vitesse) {
        this.vitesse = vitesse;
    }

    public double getPrecision() {
        return precision;
    }

    public void setPrecision(double precision) {
        this.precision = precision;
    }

    public TypePoint getTypePoint() {
        return typePoint;
    }

    public void setTypePoint(TypePoint typePoint) {
        this.typePoint = typePoint;
    }

    public Mission getMission() {
        return mission;
    }

    public void setMission(Mission mission) {
        this.mission = mission;
    }
}
