package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.entity.Reparation;
import com.ibrahim.parcvision.service.ReparationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class ReparationController {

    private ReparationService reparationService;
    public ReparationController(ReparationService reparationService){
        this.reparationService = reparationService;
    }

    //Reparation count
    @GetMapping("admin/reparation/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_reparation", reparationService.countReparation());
        stats.put("EnCours", reparationService.countByEtat("En cours"));
        stats.put("urgences", reparationService.countByEtat("En attente"));
        stats.put("Budget", reparationService.BudgetTotal());
        return stats;
    }

    @GetMapping("/admin/reparation")
    public Page<Reparation> findAll(@RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "5") int size) {
        return reparationService.findAll(page, size);
    }

    @GetMapping("/admin/reparation/filterByStatut")
    public Page<Reparation> filterByStatut(@RequestParam String statut,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "5") int size) {
        return reparationService.findByStatut(statut, page, size);
    }

    @GetMapping("/admin/reparation/search")
    public Page<Reparation> search(@RequestParam String immat,
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "5") int size) {
        return reparationService.search(immat, page, size);
    }

    @DeleteMapping("admin/reparation/delete/{id}")
    public void Delete(@PathVariable long id){
        reparationService.Delete(id);
    }

    @PutMapping("admin/reparation/update/{id}")
    public ResponseEntity<Reparation> updateReparation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(reparationService.updateReparation(id, updates));
    }

    @PostMapping("/admin/reparation/add")
    public Reparation Addreparation(@RequestBody Reparation reparation){
        return reparationService.saveReparation(reparation);
    }

}
