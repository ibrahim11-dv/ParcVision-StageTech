package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.enums.StatutVehicule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VehiculeRepository extends JpaRepository<Vehicule, Long> {

    long countByStatutVehicule(StatutVehicule statut);

    Page<Vehicule> findByStatutVehicule(StatutVehicule statut, Pageable pageable);

    @Query(value = "SELECT v FROM Vehicule v WHERE " +
            "LOWER(v.marque) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :search, '%'))",
           countQuery = "SELECT count(v) FROM Vehicule v WHERE " +
            "LOWER(v.marque) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Vehicule> findBySearch(@Param("search") String search, Pageable pageable);

    @Query(value = "SELECT v FROM Vehicule v WHERE " +
            "(LOWER(v.marque) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "v.statutVehicule = :statut",
           countQuery = "SELECT count(v) FROM Vehicule v WHERE " +
            "(LOWER(v.marque) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.model) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(v.immatriculation) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "v.statutVehicule = :statut")
    Page<Vehicule> findBySearchAndStatut(@Param("search") String search,
                                         @Param("statut") StatutVehicule statut,
                                         Pageable pageable);
}