package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccidentRepository extends JpaRepository<Accident, Long> {

    @Query("SELECT COUNT(a) FROM Accident a JOIN a.vehicule v WHERE a.etat = :etat AND v.entreprise = :entreprise")
    long countByEtat(@Param("etat") String etat, @Param("entreprise") Entreprise entreprise);

    @Query("SELECT SUM(a.budgetEstime) FROM Accident a JOIN a.vehicule v WHERE v.entreprise = :entreprise")
    Double sumBudgetEstime(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT a FROM Accident a " +
            "JOIN a.conducteur c " +
            "JOIN c.utilisateur u " +
            "JOIN a.vehicule v " +
            "WHERE (LOWER(u.nom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND v.entreprise = :entreprise")
    Page<Accident> searchByConducteurNom(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    @Query("SELECT a FROM Accident a JOIN a.vehicule v WHERE a.etat = :etat AND v.entreprise = :entreprise")
    Page<Accident> findByEtat(@Param("etat") String etat, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    Page<Accident> findByVehiculeEntreprise(Entreprise entreprise, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Accident a JOIN a.vehicule v WHERE v.entreprise = :entreprise")
    long countByVehiculeEntreprise(@Param("entreprise") Entreprise entreprise);
}
