package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Depannage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepannageRepository extends JpaRepository<Depannage, Long> {
    List<Depannage> findByVehicule_Entreprise_Id(Long entrepriseId);
    long countByVehicule_Entreprise_Id(Long entrepriseId);
}
