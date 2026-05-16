package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DepannageRepository extends JpaRepository<Depannage, Long> {

    @Query("SELECT d FROM Depannage d " +
            "JOIN d.vehicule v " +
            "WHERE (LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(d.descriptionPanne) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND v.entreprise = :entreprise")
    Page<Depannage> search(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    @Query("SELECT d FROM Depannage d JOIN d.vehicule v WHERE d.statut = :statut AND v.entreprise = :entreprise")
    Page<Depannage> findByStatut(@Param("statut") String statut, @Param("entreprise") Entreprise entreprise, Pageable pageable);
    
    @Query("SELECT COUNT(d) FROM Depannage d JOIN d.vehicule v WHERE v.entreprise = :entreprise")
    long countTotal(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT COUNT(d) FROM Depannage d JOIN d.vehicule v WHERE (d.statut = 'encours' OR d.statut = 'En cours') AND v.entreprise = :entreprise")
    long countEnCours(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT SUM(d.coutTotal) FROM Depannage d JOIN d.vehicule v WHERE v.entreprise = :entreprise")
    Double sumFrais(@Param("entreprise") Entreprise entreprise);

    Page<Depannage> findByVehiculeEntreprise(Entreprise entreprise, Pageable pageable);
}
