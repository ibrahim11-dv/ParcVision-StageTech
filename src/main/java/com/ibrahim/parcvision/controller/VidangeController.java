package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.service.VidangeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vidanges")
public class VidangeController {

    private VidangeService vidangeService;

    public VidangeController(VidangeService vidangeService) {
        this.vidangeService = vidangeService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllVidanges(HttpServletRequest request) {
        return vidangeService.getAllVidanges(request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVidangeById(@PathVariable Long id) {
        return vidangeService.getVidangeById(id);
    }

    private Vidange mapPayloadToVidange(Map<String, Object> payload) {
        Vidange vidange = new Vidange();
        if (payload.get("dateIntervention") != null) {
            vidange.setDateIntervention(java.time.LocalDate.parse((String) payload.get("dateIntervention")));
        }
        vidange.setTypeHuile((String) payload.get("typeHuile"));
        vidange.setViscosite((String) payload.get("viscosite"));
        
        if (payload.get("filterHuileChange") != null) {
            vidange.setFilterHuileChange((Boolean) payload.get("filterHuileChange"));
        }
        if (payload.get("filterAirChange") != null) {
            vidange.setFilterAirChange((Boolean) payload.get("filterAirChange"));
        }
        if (payload.get("filterCarburantChange") != null) {
            vidange.setFilterCarburantChange((Boolean) payload.get("filterCarburantChange"));
        }

        vidange.setDescriptionPanne((String) payload.get("descriptionPanne"));
        vidange.setActionsMenees((String) payload.get("actionsMenees"));
        
        if (payload.get("coutTotal") != null) {
            vidange.setCoutTotal(Double.parseDouble(payload.get("coutTotal").toString()));
        }
        if (payload.get("kilometrageAuMoment") != null) {
            vidange.setKilometrageAuMoment(Long.parseLong(payload.get("kilometrageAuMoment").toString()));
        }
        return vidange;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createVidange(
            @RequestBody Map<String, Object> payload
    ) {
        Vidange vidange = mapPayloadToVidange(payload);
        Long vehiculeId = Long.parseLong(payload.get("vehiculeId").toString());
        return vidangeService.createVidange(vidange, vehiculeId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateVidange(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload
    ) {
        Vidange vidange = mapPayloadToVidange(payload);
        Long vehiculeId = payload.get("vehiculeId") != null ? Long.parseLong(payload.get("vehiculeId").toString()) : null;
        return vidangeService.updateVidange(id, vidange, vehiculeId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVidange(@PathVariable Long id) {
        return vidangeService.deleteVidange(id);
    }

    @GetMapping("/vehicules")
    public ResponseEntity<List<Map<String, Object>>> getVehicules(HttpServletRequest request) {
        return vidangeService.getVehicules(request);
    }
}
