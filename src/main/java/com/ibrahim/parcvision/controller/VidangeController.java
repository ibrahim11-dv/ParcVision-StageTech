package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Vidange;
import com.ibrahim.parcvision.service.VidangeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vidanges")
@CrossOrigin(origins = "*")
public class VidangeController {

    private final VidangeService vidangeService;

    public VidangeController(VidangeService vidangeService) {
        this.vidangeService = vidangeService;
    }

    @GetMapping
    public List<Vidange> findAll() {
        return vidangeService.findAll();
    }

    @GetMapping("/search")
    public List<Vidange> search(@RequestParam String query) {
        return vidangeService.search(query);
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
