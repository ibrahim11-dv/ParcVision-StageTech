package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.RegistrationRequestDao;
import com.ibrahim.parcvision.entity.Admin;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/registration")
@RestController
public class RegistrationController {
    RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/register-Enterprise")
    public ResponseEntity<?> registerEntreprise(
            @RequestBody RegistrationRequestDao registrationRequestDao,
            BindingResult bindingResult
    ){
        return registrationService.registerEntreprise(registrationRequestDao,bindingResult);
    }

}
