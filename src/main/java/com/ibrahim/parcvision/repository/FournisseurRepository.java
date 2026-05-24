package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Fournisseur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

    Page<Fournisseur> findByEntreprise(Entreprise entreprise, Pageable pageable);

    java.util.List<Fournisseur> findByEntreprise(Entreprise entreprise);

    long countByEntreprise(Entreprise entreprise);

    long countByTypeFournisseurAndEntreprise(String typeFournisseur, Entreprise entreprise);

    @Query("SELECT f FROM Fournisseur f WHERE f.entreprise = :entreprise AND " +
           "(LOWER(f.nomFournisseur) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.ville) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.typeFournisseur) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Fournisseur> search(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);
}
