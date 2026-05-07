package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Vehicule;
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface VehiculeRepository extends CrudRepository<Vehicule, Long> {
    List<Vehicule> findByEntreprise(Entreprise entreprise);
}
