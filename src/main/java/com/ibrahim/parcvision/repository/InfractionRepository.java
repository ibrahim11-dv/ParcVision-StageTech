package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Infraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface InfractionRepository extends JpaRepository<Infraction, Long> {
    Page<Infraction> findByEntreprise(Entreprise entreprise, Pageable pageable);

    @Query("SELECT i FROM Infraction i WHERE i.entreprise = :entreprise " +
           "AND (LOWER(i.categorie) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Infraction> findBySearch(String search, Entreprise entreprise, Pageable pageable);
}
