package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Document;
import com.ibrahim.parcvision.entity.DossierArchivage;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDossier(DossierArchivage dossier, org.springframework.data.domain.Sort sort);

    @Query("SELECT d FROM Document d WHERE d.dossier.entreprise = :entreprise AND (" +
           "LOWER(d.nomFichier) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.ocrContent) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchDocuments(@Param("entreprise") Entreprise entreprise, @Param("query") String query);
}
