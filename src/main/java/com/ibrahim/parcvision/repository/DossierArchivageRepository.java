package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.DossierArchivage;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DossierArchivageRepository extends JpaRepository<DossierArchivage, Long> {

    /** Get all root-level folders (parent = null) for a given enterprise */
    List<DossierArchivage> findByEntrepriseAndParentIsNull(Entreprise entreprise);

    /** Get children of a specific folder */
    List<DossierArchivage> findByParent(DossierArchivage parent, org.springframework.data.domain.Sort sort);

    /** Find root folder by enterprise (parent null, nom = "/") */
    Optional<DossierArchivage> findByEntrepriseAndParentIsNullAndNom(Entreprise entreprise, String nom);

    @Query("SELECT d FROM DossierArchivage d WHERE d.entreprise = :entreprise AND LOWER(d.nom) LIKE LOWER(CONCAT('%', :query, '%')) AND d.nom <> '/'")
    List<DossierArchivage> searchDossiers(@Param("entreprise") Entreprise entreprise, @Param("query") String query);
}
