package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Vehicule;
import com.ibrahim.parcvision.service.VehiculeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicules")
@CrossOrigin(origins = "*")
public class VehiculeController {

    private final VehiculeService vehiculeService;

    public VehiculeController(VehiculeService vehiculeService) {
        this.vehiculeService = vehiculeService;
    }

    @GetMapping
    public List<Vehicule> findAll() {
        return vehiculeService.findAll();
    }
    
    @PostMapping
    public Vehicule save(@RequestBody Vehicule vehicule) {
        return vehiculeService.save(vehicule);
    }
}
