package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.VehiculeRequestDao;
import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.service.VehiculeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicules")
@CrossOrigin(origins = "*")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    @Autowired
    public VehiculeController(VehiculeService vehiculeService) {
        this.vehiculeService = vehiculeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerVehicule(@ModelAttribute VehiculeRequestDao dto) {
        try {
            vehiculeService.ajouterVehicule(dto);
            return ResponseEntity.ok(Map.of("message", "Véhicule enregistré avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Vehicule>> listerVehicules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String statut) {
        Page<Vehicule> vehicules = vehiculeService.listerVehicules(page, size, search, statut);
        return ResponseEntity.ok(vehicules);
    }

    @GetMapping("/all")
    public List<Vehicule> findAll() {
        return vehiculeService.findAll();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(vehiculeService.getStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehicule> getVehicule(@PathVariable Long id) {
        return ResponseEntity.ok(vehiculeService.getVehicule(id));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modifierVehicule(@PathVariable Long id,
                                              @ModelAttribute VehiculeRequestDao dto) {
        try {
            vehiculeService.modifierVehicule(id, dto);
            return ResponseEntity.ok(Map.of("message", "Véhicule modifié avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerVehicule(@PathVariable Long id) {
        try {
            vehiculeService.supprimerVehicule(id);
            return ResponseEntity.ok(Map.of("message", "Véhicule supprimé"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/save")
    public Vehicule save(@RequestBody Vehicule vehicule) {
        return vehiculeService.save(vehicule);
    }
}
