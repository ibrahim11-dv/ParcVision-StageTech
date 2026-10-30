package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Depense;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepenseRepository extends JpaRepository<Depense, Long> {

    Page<Depense> findByEntreprise(Entreprise entreprise, Pageable pageable);

    @Query("SELECT d FROM Depense d WHERE d.entreprise = :entreprise AND (" +
           "LOWER(d.qui) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.sourceDepense) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.sourceDepenseCustom) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CAST(d.typePaiement AS string)) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Depense> search(@Param("query") String query, @Param("entreprise") Entreprise entreprise, Pageable pageable);

    long countByEntreprise(Entreprise entreprise);

    @Query("SELECT COALESCE(SUM(d.montant), 0) FROM Depense d WHERE d.entreprise = :entreprise")
    Double sumMontantByEntreprise(@Param("entreprise") Entreprise entreprise);

    List<Depense> findAllBySourceDepenseCustom(String sourceDepenseCustom);

    default Optional<Depense> findBySourceDepenseCustom(String sourceDepenseCustom) {
        return findAllBySourceDepenseCustom(sourceDepenseCustom).stream().findFirst();
    }

    @Query("SELECT COUNT(d) FROM Depense d WHERE d.entreprise = :entreprise AND d.typePaiement = 'CARTE_CREDIT'")
    long countByEntrepriseAndTypePaiementCarte(@Param("entreprise") Entreprise entreprise);

    @Query("SELECT COUNT(d) FROM Depense d WHERE d.entreprise = :entreprise AND d.typePaiement = 'ESPECES'")
    long countByEntrepriseAndTypePaiementEspeces(@Param("entreprise") Entreprise entreprise);
}
