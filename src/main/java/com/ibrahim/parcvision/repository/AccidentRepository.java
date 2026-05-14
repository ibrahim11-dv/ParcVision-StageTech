package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Accident;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccidentRepository extends JpaRepository<Accident, Long> {

    long countByEtat(String etat);

    @Query("SELECT SUM(a.budgetEstime) FROM Accident a")
    Double sumBudgetEstime();

    @Query("SELECT a FROM Accident a " +
            "JOIN a.conducteur c " +
            "JOIN c.utilisateur u " +
            "WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Accident> searchByConducteurNom(@Param("query") String query, Pageable pageable);

    Page<Accident> findByEtat(String query, Pageable pageable);
    Page<Accident> findAll(Pageable pageable);
}
