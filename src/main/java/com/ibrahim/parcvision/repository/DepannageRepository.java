package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Depannage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepannageRepository extends JpaRepository<Depannage, Long> {

    @Query("SELECT d FROM Depannage d " +
            "JOIN d.vehicule v " +
            "WHERE LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(d.descriptionPanne) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Depannage> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT d FROM Depannage d WHERE d.statut = :statut")
    Page<Depannage> findByStatut(@Param("statut") String statut, Pageable pageable);
    
    @Query("SELECT COUNT(d) FROM Depannage d")
    long countTotal();

    @Query("SELECT COUNT(d) FROM Depannage d WHERE d.statut = 'encours' OR d.statut = 'En cours'")
    long countEnCours();

    @Query("SELECT SUM(d.coutTotal) FROM Depannage d")
    Double sumFrais();
}
