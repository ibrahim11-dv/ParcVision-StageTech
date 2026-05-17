package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.repository.query.Param;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    @Query("SELECT COALESCE(SUM(i.coutTotal), 0) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise")
    Double sumCoutTotalByEntreprise(@Param("entreprise") Entreprise entreprise);
    
    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise")
    long countByVehiculeEntreprise(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT TYPE(i), COUNT(i) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise GROUP BY TYPE(i)")
    java.util.List<Object[]> countInterventionsByType(@Param("entreprise") Entreprise entreprise);
}
