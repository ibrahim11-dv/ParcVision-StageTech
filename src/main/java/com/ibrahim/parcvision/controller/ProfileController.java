package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.ProfileMinimalInfoDao;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import com.ibrahim.parcvision.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/info-minimal")
    public ResponseEntity<ProfileMinimalInfoDao> minimalInfo(
            HttpServletRequest request
    ){
        return profileService.getMinimalUserInfo(request);
    }



}
