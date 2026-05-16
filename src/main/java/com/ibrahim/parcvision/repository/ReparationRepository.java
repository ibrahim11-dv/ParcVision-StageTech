package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Reparation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReparationRepository extends JpaRepository<Reparation, Long> {
    
    //etat : en cours
    long countByStatutAndVehiculeEntreprise(String statut, Entreprise entreprise);
    
    //budget :
    @Query("SELECT SUM(r.coutTotal) FROM Reparation r JOIN r.vehicule v WHERE v.entreprise = :entreprise")
    Double SumBudget(@Param("entreprise") Entreprise entreprise);

    Page<Reparation> findByVehiculeEntreprise(Entreprise entreprise, Pageable pageable);

    Page<Reparation> findByStatutAndVehiculeEntreprise(String statut, Entreprise entreprise, Pageable pageable);

    @Query("SELECT r FROM Reparation r JOIN r.vehicule v WHERE LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :immat, '%')) AND v.entreprise = :entreprise")
    Page<Reparation> search(@Param("immat") String immat, @Param("entreprise") Entreprise entreprise, Pageable pageable);
    
    long countByVehiculeEntreprise(Entreprise entreprise);
}
