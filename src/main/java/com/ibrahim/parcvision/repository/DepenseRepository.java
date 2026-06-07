package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Depense;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepenseRepository extends JpaRepository<Depense, Long> {

    Page<Depense> findByEntreprise(Entreprise entreprise, Pageable pageable);

    @Query("SELECT d FROM Depense d WHERE d.entreprise = :entreprise AND (" +
           "LOWER(d.qui) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.sourceDepense) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.sourceDepenseCustom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.typePaiement) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Depense> search(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    long countByEntreprise(Entreprise entreprise);

    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d WHERE d.entreprise = :entreprise")
    Double sumMontantByEntreprise(@Param("entreprise") Entreprise entreprise);

    java.util.Optional<Depense> findBySourceDepenseCustom(String sourceDepenseCustom);
    @Query("SELECT COUNT(d) FROM Depense d WHERE d.entreprise = :entreprise AND d.typePaiement = 'CARTE_CREDIT'")
    long countByEntrepriseAndTypePaiementCarte(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT COUNT(d) FROM Depense d WHERE d.entreprise = :entreprise AND d.typePaiement = 'ESPECES'")
    long countByEntrepriseAndTypePaiementEspeces(@Param("entreprise") Entreprise entreprise);
}
