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
    List<DossierArchivage> findByParent(DossierArchivage parent);

    /** Find root folder by enterprise (parent null, nom = "/") */
    Optional<DossierArchivage> findByEntrepriseAndParentIsNullAndNom(Entreprise entreprise, String nom);
}
