package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.RegistrationRequestDao;
import com.ibrahim.parcvision.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<?> registerEntreprise(
            @RequestBody @Valid RegistrationRequestDao registrationRequestDao
    ){
        return registrationService.registerEntreprise(registrationRequestDao);
    }

}
