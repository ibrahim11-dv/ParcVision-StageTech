package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Fournisseur;
import com.ibrahim.parcvision.entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Long> {

    @Query("SELECT COALESCE(SUM(i.coutTotal), 0) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise")
    Double sumCoutTotalByEntreprise(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT COUNT(i) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise")
    long countByVehiculeEntreprise(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT TYPE(i), COUNT(i) FROM Intervention i WHERE i.vehicule.entreprise = :entreprise GROUP BY TYPE(i)")
    List<Object[]> countInterventionsByType(@Param("entreprise") Entreprise entreprise);

    List<Intervention> findByFournisseur(Fournisseur fournisseur);
}
