package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InterventionRepository extends JpaRepository<Intervention, Long> {
    List<Intervention> findByVehicule_Entreprise_Id(Long entrepriseId);
    long countByVehicule_Entreprise_Id(Long entrepriseId);
}
