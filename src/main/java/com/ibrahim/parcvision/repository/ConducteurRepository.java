package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface ConducteurRepository extends CrudRepository<Conducteur, Long> {
    List<Conducteur> findByUtilisateurEntreprise(Entreprise entreprise);
}
