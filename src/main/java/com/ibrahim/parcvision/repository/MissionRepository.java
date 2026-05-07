package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Mission;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface MissionRepository extends CrudRepository<Mission, Long> {
    List<Mission> findByEntreprise(Entreprise entreprise);
}
