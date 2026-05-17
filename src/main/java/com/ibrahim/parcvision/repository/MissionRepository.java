package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Mission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByEntreprise(Entreprise entreprise);
    long countByEntreprise(Entreprise entreprise);

    @Query(value = "SELECT CAST(m.dataDebut AS DATE) AS dateStr, m.statut, COUNT(m) " +
           "FROM Mission m WHERE m.entreprise = :entreprise " +
           "GROUP BY CAST(m.dataDebut AS DATE), m.statut " +
           "ORDER BY dateStr ASC")
    List<Object[]> countMissionsByDayAndStatut(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT COUNT(m) FROM Mission m WHERE m.entreprise = :entreprise AND m.statut = 'EN_COURS'")
    long countMissionsEnCoursByEntreprise(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT m FROM Mission m WHERE m.entreprise = :entreprise AND (" +
           "LOWER(m.reference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.conducteur.utilisateur.nom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.conducteur.utilisateur.prenom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.vehicule.marque) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.vehicule.model) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.adresseDepart) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.adressArrivee) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Mission> searchMissions(@Param("entreprise") Entreprise entreprise, @Param("query") String query, Pageable pageable);

    Page<Mission> findByEntreprise(Entreprise entreprise, Pageable pageable);
}
