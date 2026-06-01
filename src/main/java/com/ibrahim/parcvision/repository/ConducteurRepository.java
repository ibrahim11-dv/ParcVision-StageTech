package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.enums.Statut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConducteurRepository extends JpaRepository<Conducteur, Long> {
    List<Conducteur> findByUtilisateur_Entreprise_Id(Long entrepriseId);
    long countByUtilisateur_Entreprise_Id(Long entrepriseId);
    long countByUtilisateur_Entreprise_IdAndStatut(Long entrepriseId, Statut statut);
}
