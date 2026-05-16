package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.enums.Statut;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConducteurRepository extends JpaRepository<Conducteur, Long> {

    long countByStatutAndUtilisateurEntreprise(Statut statut, Entreprise entreprise);
    long countByUtilisateurEntreprise(Entreprise entreprise);

    List<Conducteur> findByUtilisateurEntreprise(Entreprise entreprise);

    // Recherche par nom, prénom, email (sur l'utilisateur lié) + Entreprise
    @Query(value = "SELECT c FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "u.entreprise = :entreprise AND (" +
            "LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))",
            countQuery = "SELECT COUNT(c) FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "u.entreprise = :entreprise AND (" +
            "LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Conducteur> findBySearch(@Param("search") String search, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    // Recherche + filtre statut + Entreprise
    @Query(value = "SELECT c FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "u.entreprise = :entreprise AND " +
            "(LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND c.statut = :statut",
            countQuery = "SELECT COUNT(c) FROM Conducteur c JOIN c.utilisateur u WHERE " +
            "u.entreprise = :entreprise AND " +
            "(LOWER(u.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND c.statut = :statut")
    Page<Conducteur> findBySearchAndStatut(@Param("search") String search,
                                           @Param("statut") Statut statut,
                                           @Param("entreprise") Entreprise entreprise,
                                           Pageable pageable);

    // Filtre par statut seul + Entreprise
    Page<Conducteur> findByStatutAndUtilisateurEntreprise(Statut statut, Entreprise entreprise, Pageable pageable);

    Page<Conducteur> findByUtilisateurEntreprise(Entreprise entreprise, Pageable pageable);
}
