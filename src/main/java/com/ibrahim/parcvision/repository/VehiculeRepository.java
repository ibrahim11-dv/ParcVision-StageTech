package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {
    List<Vehicule> findByEntreprise_Id(Long entrepriseId);
}
