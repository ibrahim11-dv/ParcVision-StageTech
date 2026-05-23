package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.service.AccidentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AccidentController {

    private final AccidentService accidentService;

    public AccidentController(AccidentService accidentService) {
        this.accidentService = accidentService;
    }


    @GetMapping("/admin/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAccidents", accidentService.countAccident());
        stats.put("enReparation", accidentService.getNombreEnReparation());
        stats.put("budgetTotal", accidentService.getTotalBudget());
        return stats;
    }

    @GetMapping("/admin/search")
    public Page<Accident> SearchCond(@RequestParam String query,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size){
        return accidentService.Search(query, page, size);
    }

    @GetMapping("/admin/findByEtat")
    public Page<Accident> findEtat(@RequestParam String etat,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "5") int size){
        return accidentService.findByetat(etat, page, size);
    }

    @GetMapping("/admin/list")
    public Page<Accident> findall(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "5") int size){
        return accidentService.AffichAll(page, size);
    }

    @PutMapping(value = "/admin/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateAccident(
            @PathVariable Long id,
            @RequestParam("etat") String etat,
            @RequestParam("budgetEstime") Double budgetEstime,
            @RequestParam("notes") String notes,
            @RequestParam(value = "deletedPhotos", required = false) List<String> deletedPhotos,
            @RequestParam(value = "photos", required = false) MultipartFile[] photos) {
        try {
            Accident updated = accidentService.updateAccident(id, etat, budgetEstime, notes, deletedPhotos, photos);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> deleteAccident(@PathVariable Long id) {
        accidentService.deleteAccident(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/admin/Add", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> AddAccident(
            @RequestParam("vehiculeId") Long vehiculeId,
            @RequestParam("conducteurId") Long conducteurId,
            @RequestParam("dateIntervention") String dateIntervention,
            @RequestParam("descriptionPanne") String descriptionPanne,
            @RequestParam("lieu") String lieu,
            @RequestParam("contexte") String contexte,
            @RequestParam("gravite") String gravite,
            @RequestParam("etat") String etat,
            @RequestParam("budgetEstime") Double budgetEstime,
            @RequestParam(value = "photos", required = false) MultipartFile[] photos) {
        try {
            Accident saved = accidentService.addAccident(vehiculeId, conducteurId, dateIntervention,
                    descriptionPanne, lieu, contexte, gravite, etat, budgetEstime, photos);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
