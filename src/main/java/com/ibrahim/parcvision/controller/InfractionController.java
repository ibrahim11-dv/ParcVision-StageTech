package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.InfractionRequestDao;
import com.ibrahim.parcvision.entity.Infraction;
import com.ibrahim.parcvision.service.InfractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/infractions")
@PreAuthorize("hasAuthority('ADMIN')")
public class InfractionController {

    private final InfractionService infractionService;

    @Autowired
    public InfractionController(InfractionService infractionService) {
        this.infractionService = infractionService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ajouterInfraction(@ModelAttribute InfractionRequestDao dto) {
        try {
            Infraction infraction = infractionService.ajouterInfraction(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(infraction);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement du fichier d'infraction");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modifierInfraction(@PathVariable Long id, @ModelAttribute InfractionRequestDao dto) {
        dto.setId(id);
        return ajouterInfraction(dto);
    }

    @GetMapping
    public ResponseEntity<Page<Infraction>> listerInfractions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Page<Infraction> infractions = infractionService.listerInfractions(page, size, search);
        return ResponseEntity.ok(infractions);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerInfraction(@PathVariable Long id) {
        try {
            infractionService.supprimerInfraction(id);
            return ResponseEntity.ok("Infraction supprimée avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
