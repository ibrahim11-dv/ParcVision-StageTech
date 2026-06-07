package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.ConducteurRequestDao;
import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.service.ConducteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/conducteurs")
@CrossOrigin(origins = "*")
public class ConducteurController {


    @Autowired
    private ConducteurService conducteurService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerConducteur(@ModelAttribute ConducteurRequestDao dto) {
        try {
            conducteurService.ajouterConducteur(dto);
            return ResponseEntity.ok(Map.of("message", "Conducteur enregistré avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Conducteur>> listerConducteurs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String statut) {
        Page<Conducteur> conducteurs = conducteurService.listerConducteurs(page, size, search, statut);
        return ResponseEntity.ok(conducteurs);
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<Conducteur>> findAll() {
        return ResponseEntity.ok(conducteurService.findAll());
    }

    // 3. Statistiques rapides (KPI)
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(conducteurService.getStats());
    }

    // 4. Détail d'un conducteur (pour le modal de modification)
    @GetMapping("/{id}")
    public ResponseEntity<Conducteur> getConducteur(@PathVariable Long id) {
        return ResponseEntity.ok(conducteurService.getConducteur(id));
    }

    // 5. Modification (avec ou sans fichiers)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modifierConducteur(@PathVariable Long id,
                                                @ModelAttribute ConducteurRequestDao dto) {
        try {
            conducteurService.modifierConducteur(id, dto);
            return ResponseEntity.ok(Map.of("message", "Conducteur modifié avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. Suppression
    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerConducteur(@PathVariable Long id) {
        try {
            conducteurService.supprimerConducteur(id);
            return ResponseEntity.ok(Map.of("message", "Conducteur supprimé"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}