package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Assurance;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssuranceRepository extends JpaRepository<Assurance, Long> {

    @Query("SELECT a FROM Assurance a WHERE a.vehicule.entreprise = :entreprise")
    Page<Assurance> findByEntreprise(@Param("entreprise") Entreprise entreprise, Pageable pageable);

    @Query("SELECT COUNT(a) FROM Assurance a WHERE a.vehicule.entreprise = :entreprise")
    long countByEntreprise(@Param("entreprise") Entreprise entreprise);

    @Query(value = "SELECT a FROM Assurance a WHERE a.vehicule.entreprise = :entreprise AND (" +
            "LOWER(a.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(a.nomPrestataire) LIKE LOWER(CONCAT('%', :search, '%'))" +
            ")",
            countQuery = "SELECT COUNT(a) FROM Assurance a WHERE a.vehicule.entreprise = :entreprise AND (" +
                    "LOWER(a.vehicule.immatriculation) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
                    "LOWER(a.nomPrestataire) LIKE LOWER(CONCAT('%', :search, '%'))" +
                    ")")
    Page<Assurance> findBySearch(@Param("search") String search, @Param("entreprise") Entreprise entreprise, Pageable pageable);
}
