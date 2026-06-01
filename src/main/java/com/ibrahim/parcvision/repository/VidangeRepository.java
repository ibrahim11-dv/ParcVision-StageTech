package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Vidange;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VidangeRepository extends JpaRepository<Vidange, Long> {
    List<Vidange> findByVehicule_Entreprise_Id(Long entrepriseId);
    List<Vidange> findByVehicule_Id(Long vehiculeId);
}
