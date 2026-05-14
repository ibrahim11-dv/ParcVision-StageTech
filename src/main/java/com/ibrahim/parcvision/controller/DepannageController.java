package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.service.DepannageService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/depannage-api")
@CrossOrigin(origins = "*")
public class DepannageController {

    private final DepannageService depannageService;

    public DepannageController(DepannageService depannageService) {
        this.depannageService = depannageService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", depannageService.countTotal());
        stats.put("enCours", depannageService.countEnCours());
        stats.put("frais", depannageService.sumFrais());
        return stats;
    }

    @GetMapping
    public Page<Depannage> findAll(@RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "3") int size) {
        return depannageService.findAll(page, size);
    }

    @GetMapping("/search")
    public Page<Depannage> search(@RequestParam String query,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "3") int size) {
        return depannageService.search(query, page, size);
    }

    @GetMapping("/filter")
    public Page<Depannage> filter(@RequestParam String statut,
                                  @RequestParam(defaultValue = "0") int page,
                                  @RequestParam(defaultValue = "3") int size) {
        return depannageService.findByStatut(statut, page, size);
    }

    @PostMapping("/add")
    public Depannage add(@RequestBody Depannage depannage) {
        return depannageService.save(depannage);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Depannage> update(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(depannageService.update(id, updates));
    }

    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable Long id) {
        depannageService.delete(id);
    }
}
