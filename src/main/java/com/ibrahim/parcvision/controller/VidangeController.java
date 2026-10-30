package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.service.VidangeService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vidanges")
@CrossOrigin(origins = "*")
public class VidangeController {

    private final VidangeService vidangeService;

    public VidangeController(VidangeService vidangeService) {
        this.vidangeService = vidangeService;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return vidangeService.getStats();
    }

    @GetMapping
    public Page<Vidange> findAll(@RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "5") int size,
                                 @RequestParam(required = false) String status) {
        if (status != null && !status.isBlank() && !"Tous".equalsIgnoreCase(status)) {
            return vidangeService.findByStatus(status, page, size);
        }
        return vidangeService.findAll(page, size);
    }

    @GetMapping("/filter")
    public Page<Vidange> filter(@RequestParam String status,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "5") int size) {
        return vidangeService.findByStatus(status, page, size);
    }

    @GetMapping("/search")
    public Page<Vidange> search(@RequestParam String query,
                                @RequestParam(defaultValue = "0") int page,
                                @RequestParam(defaultValue = "5") int size) {
        return vidangeService.search(query, page, size);
    }

    @PostMapping
    public Vidange save(@RequestBody Vidange vidange) {
        return vidangeService.save(vidange);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Vidange> update(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(vidangeService.update(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vidangeService.delete(id);
        return ResponseEntity.ok().build();
    }
}
