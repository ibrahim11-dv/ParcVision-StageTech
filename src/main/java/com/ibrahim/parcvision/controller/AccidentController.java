package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.service.AccidentService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
                                     @RequestParam(defaultValue = "3") int size){
        return accidentService.Search(query, page, size);
    }

    @GetMapping("/admin/findByEtat")
    public Page<Accident> findEtat(@RequestParam String etat,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "3") int size){
        return accidentService.findByetat(etat, page, size);
    }

    @GetMapping("/admin/list")
    public Page<Accident> findall(@RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "3") int size){
        return accidentService.AffichAll(page, size);
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<Accident> updateAccident(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(accidentService.updateAccident(id, updates));
    }

    @DeleteMapping("/admin/delete/{id}")
    public ResponseEntity<Void> deleteAccident(@PathVariable Long id) {
        accidentService.deleteAccident(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/admin/Add")
    public Accident AddAccident(@RequestBody Accident accident){
        return accidentService.saveAccident(accident);
    }
}
