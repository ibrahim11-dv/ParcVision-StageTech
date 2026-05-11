package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Document;
import com.ibrahim.parcvision.entity.DossierArchivage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByDossier(DossierArchivage dossier);
}
