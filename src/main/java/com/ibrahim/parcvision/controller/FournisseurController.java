package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Fournisseur;
import com.ibrahim.parcvision.service.FournisseurService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class FournisseurController {

    private final FournisseurService fournisseurService;

    public FournisseurController(FournisseurService fournisseurService) {
        this.fournisseurService = fournisseurService;
    }

    @GetMapping("admin/fournisseur/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_fournisseurs", fournisseurService.countFournisseur());
        stats.put("fournisseur_count", fournisseurService.countByType("Fournisseur"));
        stats.put("garage_count", fournisseurService.countByType("Garage"));
        stats.put("station_count", fournisseurService.countByType("Station de Gazoil"));
        return stats;
    }

    @GetMapping("/admin/fournisseur")
    public Page<Fournisseur> findAll(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "5") int size) {
        return fournisseurService.findAll(page, size);
    }

    @GetMapping("/admin/fournisseur/all")
    public java.util.List<Fournisseur> findAllList() {
        return fournisseurService.findAllList();
    }

    @GetMapping("/admin/fournisseur/search")
    public Page<Fournisseur> search(@RequestParam String query,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "5") int size) {
        return fournisseurService.search(query, page, size);
    }

    @PostMapping("/admin/fournisseur/add")
    public Fournisseur save(@RequestBody Fournisseur fournisseur) {
        return fournisseurService.saveFournisseur(fournisseur);
    }

    @PutMapping("admin/fournisseur/update/{id}")
    public Fournisseur update(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return fournisseurService.updateFournisseur(id, updates);
    }

    @DeleteMapping("admin/fournisseur/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        fournisseurService.Delete(id);
        return ResponseEntity.ok().build();
    }
}
