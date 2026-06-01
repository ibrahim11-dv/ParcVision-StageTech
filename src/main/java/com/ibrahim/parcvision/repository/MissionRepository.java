package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Mission;
import com.ibrahim.parcvision.enums.StatutMission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {
    List<Mission> findByEntreprise_Id(Long entrepriseId);
    long countByEntreprise_Id(Long entrepriseId);
    long countByEntreprise_IdAndStatut(Long entrepriseId, StatutMission statut);
}
