package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Accident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AccidentRepository extends JpaRepository<Accident, Long> {
    long count();

    long countByEtat(String etat);

    @Query("SELECT SUM(a.budgetEstime) FROM Accident a")
    Double sumBudgetEstime();

    @Query("SELECT a FROM Accident a " +
            "JOIN a.conducteur c " +
            "JOIN c.utilisateur u " +
            "WHERE LOWER(u.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(a.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Accident> searchByConducteurNom(@Param("query") String query);

    List<Accident> findByEtat(String query);
    List<Accident> findAll();
}
