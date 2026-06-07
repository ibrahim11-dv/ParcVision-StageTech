package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Depense;
import com.ibrahim.parcvision.service.DepenseService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/depenses")
@CrossOrigin(origins = "*")
public class DepenseController {

    private final DepenseService depenseService;

    public DepenseController(DepenseService depenseService) {
        this.depenseService = depenseService;
    }

    @GetMapping
    public Page<Depense> findAll(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "5") int size) {
        return depenseService.findAll(page, size);
    }

    @GetMapping("/search")
    public Page<Depense> search(@RequestParam String query,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "5") int size) {
        return depenseService.search(query, page, size);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", depenseService.count());
        stats.put("totalMontant", depenseService.totalMontant());
        stats.put("carteCount", depenseService.countCarte());
        stats.put("especesCount", depenseService.countEspeces());
        return stats;
    }

    @PostMapping
    public Depense save(@RequestBody Depense depense) {
        return depenseService.save(depense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Depense> update(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(depenseService.update(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        depenseService.delete(id);
        return ResponseEntity.ok().build();
    }
}
