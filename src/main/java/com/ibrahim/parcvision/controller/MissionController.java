package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.AddMissionDao;
import com.ibrahim.parcvision.dao.MissionResponseDao;
import com.ibrahim.parcvision.entity.Mission;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.StatutMission;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.service.JwtService;
import com.ibrahim.parcvision.service.MissionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;
    private final JwtService jwtService;
    private final UtilisateurRepository utilisateurRepository;

    public MissionController(MissionService missionService, 
                             JwtService jwtService, 
                             UtilisateurRepository utilisateurRepository) {
        this.missionService = missionService;
        this.jwtService = jwtService;
        this.utilisateurRepository = utilisateurRepository;
    }

    @GetMapping
    public ResponseEntity<Page<MissionResponseDao>> getAllMissions(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<MissionResponseDao> missions = missionService.getMissionsPaged(user.getEntreprise(), search, pageable);
        return ResponseEntity.ok(missions);
    }

    @PostMapping
    public ResponseEntity<?> saveMission(@Valid @RequestBody AddMissionDao missionDao) {
        try {
            Mission savedMission = missionService.addMission(missionDao);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMission);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create mission: " + e.getMessage());
        }
    }

    @GetMapping("/conducteurs")
    public ResponseEntity<List<Map<String, Object>>> getConducteurs(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(missionService.getAvailableConducteurs(user.getEntreprise()));
    }

    @GetMapping("/vehicules")
    public ResponseEntity<List<Map<String, Object>>> getVehicules(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(missionService.getAvailableVehicules(user.getEntreprise()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam StatutMission status) {
        try {
            missionService.updateMissionStatus(id, status);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMission(
            @PathVariable Long id,
            @Valid @RequestBody com.ibrahim.parcvision.dao.UpdateMissionDao updateDao
    ) {
        try {
            updateDao.setId(id);
            missionService.updateMission(updateDao);
            return ResponseEntity.ok().body("Mission updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update mission: " + e.getMessage());
        }
    }
}
