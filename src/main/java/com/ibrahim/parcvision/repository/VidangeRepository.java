package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Vidange;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VidangeRepository extends JpaRepository<Vidange, Long> {
    
    Page<Vidange> findByVehiculeEntreprise(Entreprise entreprise, Pageable pageable);

    @Query("SELECT v FROM Vidange v JOIN v.vehicule veh WHERE (LOWER(veh.immatriculation) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(v.descriptionPanne) LIKE LOWER(CONCAT('%', :query, '%'))) AND veh.entreprise = :entreprise")
    Page<Vidange> search(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);
}
