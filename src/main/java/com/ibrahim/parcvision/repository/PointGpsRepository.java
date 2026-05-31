package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Mission;
import com.ibrahim.parcvision.entity.PointGPS;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PointGpsRepository extends JpaRepository<PointGPS,Long> {
    List<PointGPS> findByMissionOrderByTimeStampAsc(Mission mission);
}
