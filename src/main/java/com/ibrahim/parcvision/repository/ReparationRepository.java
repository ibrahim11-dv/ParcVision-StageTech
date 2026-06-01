package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Reparation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReparationRepository extends JpaRepository<Reparation, Long> {
    List<Reparation> findByVehicule_Entreprise_Id(Long entrepriseId);
    long countByVehicule_Entreprise_Id(Long entrepriseId);
}
