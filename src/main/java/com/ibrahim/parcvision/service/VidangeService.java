package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.repository.VehiculeRepository;
import com.ibrahim.parcvision.repository.VidangeRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VidangeService {

    private VidangeRepository vidangeRepository;
    private VehiculeRepository vehiculeRepository;
    private UtilisateurRepository utilisateurRepository;
    private JwtService jwtService;

    public VidangeService(VidangeRepository vidangeRepository, VehiculeRepository vehiculeRepository, UtilisateurRepository utilisateurRepository, JwtService jwtService) {
        this.vidangeRepository = vidangeRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
    }

    private Utilisateur getUserFromRequest(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        return utilisateurRepository.findByEmail(email).orElseThrow();
    }

    private Map<String, Object> vidangeToMap(Vidange v) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", v.getId());
        map.put("dateIntervention", v.getDateIntervention());
        map.put("descriptionPanne", v.getDescriptionPanne());
        map.put("actionsMenees", v.getActionsMenees());
        map.put("coutTotal", v.getCoutTotal());
        map.put("kilometrageAuMoment", v.getKilometrageAuMoment());
        map.put("typeHuile", v.getTypeHuile());
        map.put("viscosite", v.getViscosite());
        map.put("filterHuileChange", v.isFilterHuileChange());
        map.put("filterAirChange", v.isFilterAirChange());
        map.put("filterCarburantChange", v.isFilterCarburantChange());

        Vehicule vehicule = v.getVehicule();
        if (vehicule != null) {
            Map<String, Object> vehiculeMap = new HashMap<>();
            vehiculeMap.put("id", vehicule.getId());
            vehiculeMap.put("immatriculation", vehicule.getImmatriculation());
            vehiculeMap.put("marque", vehicule.getMarque());
            vehiculeMap.put("model", vehicule.getModel());
            vehiculeMap.put("kilometrageActuel", vehicule.getKilometrageActuel());
            map.put("vehicule", vehiculeMap);
        }
        return map;
    }

    public ResponseEntity<List<Map<String, Object>>> getAllVidanges(HttpServletRequest request) {
        Utilisateur user = getUserFromRequest(request);
        Long entrepriseId = user.getEntreprise().getId();
        List<Vidange> vidanges = vidangeRepository.findByVehicule_Entreprise_Id(entrepriseId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Vidange v : vidanges) {
            result.add(vidangeToMap(v));
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> getVidangeById(Long id) {
        Optional<Vidange> vidange = vidangeRepository.findById(id);
        return vidange.map(v -> new ResponseEntity<>(vidangeToMap(v), HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<Map<String, Object>> createVidange(Vidange vidange, Long vehiculeId) {
        try {
            Optional<Vehicule> vehicule = vehiculeRepository.findById(vehiculeId);
            if (vehicule.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            vidange.setVehicule(vehicule.get());
            Vidange saved = vidangeRepository.save(vidange);
            return new ResponseEntity<>(vidangeToMap(saved), HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Map<String, Object>> updateVidange(Long id, Vidange vidangeDetails, Long vehiculeId) {
        try {
            Optional<Vidange> existing = vidangeRepository.findById(id);
            if (existing.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            Vidange vidange = existing.get();

            if (vehiculeId != null) {
                Optional<Vehicule> vehicule = vehiculeRepository.findById(vehiculeId);
                vehicule.ifPresent(vidange::setVehicule);
            }

            if (vidangeDetails.getDateIntervention() != null) {
                vidange.setDateIntervention(vidangeDetails.getDateIntervention());
            }
            if (vidangeDetails.getTypeHuile() != null) {
                vidange.setTypeHuile(vidangeDetails.getTypeHuile());
            }
            if (vidangeDetails.getViscosite() != null) {
                vidange.setViscosite(vidangeDetails.getViscosite());
            }
            vidange.setFilterHuileChange(vidangeDetails.isFilterHuileChange());
            vidange.setFilterAirChange(vidangeDetails.isFilterAirChange());
            vidange.setFilterCarburantChange(vidangeDetails.isFilterCarburantChange());

            if (vidangeDetails.getKilometrageAuMoment() != null) {
                vidange.setKilometrageAuMoment(vidangeDetails.getKilometrageAuMoment());
            }
            if (vidangeDetails.getDescriptionPanne() != null) {
                vidange.setDescriptionPanne(vidangeDetails.getDescriptionPanne());
            }
            if (vidangeDetails.getActionsMenees() != null) {
                vidange.setActionsMenees(vidangeDetails.getActionsMenees());
            }
            vidange.setCoutTotal(vidangeDetails.getCoutTotal());

            Vidange saved = vidangeRepository.save(vidange);
            return new ResponseEntity<>(vidangeToMap(saved), HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Void> deleteVidange(Long id) {
        try {
            if (!vidangeRepository.existsById(id)) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            vidangeRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<List<Map<String, Object>>> getVehicules(HttpServletRequest request) {
        Utilisateur user = getUserFromRequest(request);
        Long entrepriseId = user.getEntreprise().getId();
        List<Vehicule> vehicules = vehiculeRepository.findByEntreprise_Id(entrepriseId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Vehicule v : vehicules) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", v.getId());
            map.put("immatriculation", v.getImmatriculation());
            map.put("marque", v.getMarque());
            map.put("model", v.getModel());
            map.put("kilometrageActuel", v.getKilometrageActuel());
            result.add(map);
        }
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
