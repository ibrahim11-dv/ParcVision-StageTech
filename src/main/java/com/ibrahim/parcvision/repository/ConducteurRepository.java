package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.enums.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConducteurRepository extends JpaRepository<Conducteur, Long> {

    long countByStatut(Statut statut);

    // Recherche par nom, prénom, email (sur l'utilisateur lié)
    @Query(value = "SELECT c FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))",
           countQuery = "SELECT COUNT(c) FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Conducteur> findBySearch(@Param("search") String search, Pageable pageable);

    // Recherche + filtre statut
    @Query(value = "SELECT c FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "(LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND c.statut = :statut",
           countQuery = "SELECT COUNT(c) FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "(LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND c.statut = :statut")
    Page<Conducteur> findBySearchAndStatut(@Param("search") String search,
                                           @Param("statut") Statut statut,
                                           Pageable pageable);

    // Filtre par statut seul
    Page<Conducteur> findByStatut(Statut statut, Pageable pageable);
}