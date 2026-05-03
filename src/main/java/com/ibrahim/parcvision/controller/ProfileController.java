package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    UtilisateurRepository utilisateurRepository;
    AdminRepository adminRepository;
    EntrepriseRepository entrepriseRepository;

    public ProfileController(UtilisateurRepository utilisateurRepository, AdminRepository adminRepository, EntrepriseRepository entrepriseRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.entrepriseRepository = entrepriseRepository;
    }

    @PostMapping("/info-minimal")
    public ResponseEntity<String> minimalInfo(){

        return ResponseEntity.ok("hi");
    }



}
