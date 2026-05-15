package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Reparation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReparationRepository extends JpaRepository<Reparation, Long> {
    
    //etat : en cours
    long countByStatut(String statut);
    
    //budget :
    @Query("SELECT SUM(r.coutTotal ) FROM Reparation r")
    double SumBudget();

    //declarer une accident :(deja methode save :))
    Page<Reparation> findAll(Pageable pageable);

    Page<Reparation> findByStatut(String statut, Pageable pageable);

    @Query("SELECT r FROM Reparation r WHERE LOWER(r.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :immat, '%'))")
    Page<Reparation> search(@Param("immat") String immat, Pageable pageable);
    //Button : pas necessaire car on va faire l appel dans js d apres onclick


}
