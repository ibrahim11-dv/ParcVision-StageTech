package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.AssuranceRequestDao;
import com.ibrahim.parcvision.entity.Assurance;
import com.ibrahim.parcvision.service.AssuranceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/assurances")
@PreAuthorize("hasAuthority('ADMIN')")
public class AssuranceController {

    private final AssuranceService assuranceService;

    @Autowired
    public AssuranceController(AssuranceService assuranceService) {
        this.assuranceService = assuranceService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ajouterAssurance(@ModelAttribute AssuranceRequestDao dto) {
        try {
            Assurance assurance = assuranceService.ajouterAssurance(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(assurance);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement de l'attestation");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> modifierAssurance(@PathVariable Long id, @ModelAttribute AssuranceRequestDao dto) {
        dto.setId(id);
        return ajouterAssurance(dto);
    }

    @GetMapping
    public ResponseEntity<Page<Assurance>> listerAssurances(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        
        Page<Assurance> assurances = assuranceService.listerAssurances(page, size, search);
        return ResponseEntity.ok(assurances);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> supprimerAssurance(@PathVariable Long id) {
        try {
            assuranceService.supprimerAssurance(id);
            return ResponseEntity.ok("Assurance supprimée avec succès");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
