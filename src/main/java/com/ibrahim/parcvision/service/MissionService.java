package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.AddMissionDao;
import com.ibrahim.parcvision.dao.MissionResponseDao;
import com.ibrahim.parcvision.dao.UpdateMissionDao;
import com.ibrahim.parcvision.entity.*;
import com.ibrahim.parcvision.enums.StatutMission;
import com.ibrahim.parcvision.enums.TypeColis;
import com.ibrahim.parcvision.enums.TypePoint;
import com.ibrahim.parcvision.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MissionService {

    private final MissionRepository missionRepository;
    private final ConducteurRepository conducteurRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ColisRepository colisRepository;
    private final PointGpsRepository pointGpsRepository;

    public MissionService(MissionRepository missionRepository, 
                          ConducteurRepository conducteurRepository, 
                          VehiculeRepository vehiculeRepository, 
                          ColisRepository colisRepository,
                          PointGpsRepository pointGpsRepository) {
        this.missionRepository = missionRepository;
        this.conducteurRepository = conducteurRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.colisRepository = colisRepository;
        this.pointGpsRepository = pointGpsRepository;
    }

    @Transactional
    public Mission addMission(AddMissionDao addMissionDao) {
        Mission mission = new Mission();
        
        // Basic fields
        mission.setDataDebut(addMissionDao.getDateDepart());
        mission.setDateFinEstimee(addMissionDao.getDateArrivee());
        mission.setAdresseDepart(addMissionDao.getAdressDepart());
        mission.setAdressArrivee(addMissionDao.getAdressDestination());
        mission.setInstructionsSpeciales(addMissionDao.getInstructionSpeciales());
        mission.setStatut(StatutMission.PLANIFIEE);
        
        // Link Conducteur
        Conducteur conducteur = conducteurRepository.findById(addMissionDao.getConducteurId())
                .orElseThrow(() -> new RuntimeException("Conducteur not found"));
        mission.setConducteur(conducteur);
        
        // Link Vehicule
        Vehicule vehicule = vehiculeRepository.findById(addMissionDao.getVehiculeId())
                .orElseThrow(() -> new RuntimeException("Vehicule not found"));
        mission.setVehicule(vehicule);
        
        // Set Enterprise from Conducteur (assuming they belong to the same enterprise)
        mission.setEntreprise(conducteur.getEntreprise());

        // Save Mission first to get an ID for related entities
        Mission savedMission = missionRepository.save(mission);

        // Create Start Point
        PointGPS startPoint = new PointGPS();
        startPoint.setLaltitude(addMissionDao.getLatitudeDepart());
        startPoint.setLongitude(addMissionDao.getLongitudeDepart());
        startPoint.setTypePoint(TypePoint.DEBUT);
        startPoint.setTimeStamp(LocalDateTime.now());
        startPoint.setMission(savedMission);
        pointGpsRepository.save(startPoint);

        // Create End Point
        PointGPS endPoint = new PointGPS();
        endPoint.setLaltitude(addMissionDao.getLatitudeDestination());
        endPoint.setLongitude(addMissionDao.getLongitudeDestination());
        endPoint.setTypePoint(TypePoint.FIN);
        endPoint.setTimeStamp(LocalDateTime.now());
        endPoint.setMission(savedMission);
        pointGpsRepository.save(endPoint);

        // Create and Link Colis
        Colis colis = new Colis();
        colis.setDescription(addMissionDao.getDescription());
        colis.setPoids(addMissionDao.getPoids());
        colis.setVolume(addMissionDao.getVolume());
        colis.setType(TypeColis.valueOf(addMissionDao.getTypeColis().toUpperCase()));
        colis.setMission(savedMission);
        
        colisRepository.save(colis);
        
        return savedMission;
    }

    public List<MissionResponseDao> getMissionsByEntreprise(Entreprise entreprise) {
        List<Mission> missions = missionRepository.findByEntreprise(entreprise);
        return missions.stream()
                .map(this::mapToResponseDao)
                .collect(Collectors.toList());
    }

    private MissionResponseDao mapToResponseDao(Mission mission) {
        MissionResponseDao response = new MissionResponseDao();
        response.setId(mission.getId());
        response.setReference(mission.getReference() != null ? mission.getReference() : "#MSN-" + String.format("%03d", mission.getId()));
        
        if (mission.getConducteur() != null) {
            response.setConducteurId(mission.getConducteur().getId());
            if (mission.getConducteur().getUtilisateur() != null) {
                Utilisateur u = mission.getConducteur().getUtilisateur();
                response.setConducteurNomComplet(u.getNom() + " " + u.getPrenom());
                response.setConducteurPhotoUrl(mission.getConducteur().getPhotoProfileUrl());
            }
        }
        
        if (mission.getVehicule() != null) {
            Vehicule v = mission.getVehicule();
            response.setVehiculeId(v.getId());
            response.setVehiculeMarqueModele(v.getMarque() + " " + v.getModel());
            response.setVehiculeImmatriculation(v.getImmatriculation());
        }
        
        if (mission.getColis() != null && !mission.getColis().isEmpty()) {
            Colis c = mission.getColis().get(0);
            response.setColisId(c.getId());
            response.setColisDescription(c.getDescription());
            response.setColisPoids(c.getPoids());
            response.setColisVolume(c.getVolume());
            response.setColisCodeSuivi(c.getCodeSuivi());
            response.setColisType(c.getType());
        }
        
        // Coordinates from PointGPS
        if (mission.getPointGPS() != null) {
            for (PointGPS p : mission.getPointGPS()) {
                if (p.getTypePoint() == TypePoint.DEBUT) {
                    response.setLatitudeDepart(p.getLaltitude());
                    response.setLongitudeDepart(p.getLongitude());
                } else if (p.getTypePoint() == TypePoint.FIN) {
                    response.setLatitudeDestination(p.getLaltitude());
                    response.setLongitudeDestination(p.getLongitude());
                }
            }
        }
        
        response.setAdresseDepart(mission.getAdresseDepart());
        response.setAdresseArrivee(mission.getAdressArrivee());
        response.setStatut(mission.getStatut());
        response.setDateDebut(mission.getDataDebut());
        response.setDateFinEstimee(mission.getDateFinEstimee());
        response.setDateFinReelle(mission.getDateFinReelle());
        response.setInstructionsSpeciales(mission.getInstructionsSpeciales());
        response.setPreuveLivraisonUrl(mission.getPreuveLivraisonUrl());
        
        return response;
    }

    public List<Map<String, Object>> getAvailableConducteurs(Entreprise entreprise) {
        List<Conducteur> conducteurs = conducteurRepository.findByUtilisateurEntreprise(entreprise);
        return conducteurs.stream().map(c -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", c.getId());
            map.put("nom", c.getUtilisateur().getNom() + " " + c.getUtilisateur().getPrenom());
            return map;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAvailableVehicules(Entreprise entreprise) {
        List<Vehicule> vehicules = vehiculeRepository.findByEntreprise(entreprise);
        return vehicules.stream().map(v -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("label", v.getMarque() + " " + v.getModel() + " (" + v.getImmatriculation() + ")");
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateMissionStatus(Long id, StatutMission status) {
        Mission mission = missionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mission not found"));
        mission.setStatut(status);
        if (status == StatutMission.TERMINEE) {
            mission.setDateFinReelle(LocalDateTime.now());
        }
        missionRepository.save(mission);
    }

    @Transactional
    public void updateMission(UpdateMissionDao updateDao) {
        Mission mission = missionRepository.findById(updateDao.getId())
                .orElseThrow(() -> new RuntimeException("Mission not found"));

        // Update basic fields
        mission.setDataDebut(updateDao.getDateDepart());
        mission.setDateFinEstimee(updateDao.getDateArrivee());
        mission.setAdresseDepart(updateDao.getAdressDepart());
        mission.setAdressArrivee(updateDao.getAdressDestination());
        mission.setInstructionsSpeciales(updateDao.getInstructionSpeciales());

        // Update Conducteur
        if (!mission.getConducteur().getId().equals(updateDao.getConducteurId())) {
            Conducteur conducteur = conducteurRepository.findById(updateDao.getConducteurId())
                    .orElseThrow(() -> new RuntimeException("Conducteur not found"));
            mission.setConducteur(conducteur);
        }

        // Update Vehicule
        if (!mission.getVehicule().getId().equals(updateDao.getVehiculeId())) {
            Vehicule vehicule = vehiculeRepository.findById(updateDao.getVehiculeId())
                    .orElseThrow(() -> new RuntimeException("Vehicule not found"));
            mission.setVehicule(vehicule);
        }

        // Update Colis (assuming one colis per mission as per addMission)
        if (mission.getColis() != null && !mission.getColis().isEmpty()) {
            Colis colis = mission.getColis().get(0);
            colis.setDescription(updateDao.getDescription());
            colis.setPoids(updateDao.getPoids());
            colis.setVolume(updateDao.getVolume());
            colis.setType(TypeColis.valueOf(updateDao.getTypeColis().toUpperCase()));
            colisRepository.save(colis);
        }

        // Update GPS Points
        if (mission.getPointGPS() != null) {
            for (PointGPS p : mission.getPointGPS()) {
                if (p.getTypePoint() == TypePoint.DEBUT) {
                    p.setLaltitude(updateDao.getLatitudeDepart());
                    p.setLongitude(updateDao.getLongitudeDepart());
                    pointGpsRepository.save(p);
                } else if (p.getTypePoint() == TypePoint.FIN) {
                    p.setLaltitude(updateDao.getLatitudeDestination());
                    p.setLongitude(updateDao.getLongitudeDestination());
                    pointGpsRepository.save(p);
                }
            }
        }

        missionRepository.save(mission);
    }
}
