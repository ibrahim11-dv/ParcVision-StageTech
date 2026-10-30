package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.ProfileMinimalInfoDao;
import com.ibrahim.parcvision.service.ProfileService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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
    ) {
        return profileService.getMinimalUserInfo(request);
    }

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> getAdminProfile(HttpServletRequest request) {
        return profileService.getAdminProfile(request);
    }

    @PutMapping("/admin")
    public ResponseEntity<Map<String, Object>> updateAdminProfile(
            HttpServletRequest request,
            HttpServletResponse response,
            @RequestBody Map<String, String> data
    ) {
        return profileService.updateAdminProfile(request, response, data);
    }

    @PutMapping("/password")
    public ResponseEntity<Map<String, Object>> updatePassword(
            HttpServletRequest request,
            @RequestBody Map<String, String> data
    ) {
        return profileService.updatePassword(request, data);
    }

    @GetMapping("/entreprise")
    public ResponseEntity<Map<String, Object>> getEntrepriseProfile(HttpServletRequest request) {
        return profileService.getEntrepriseProfile(request);
    }

    @PutMapping("/entreprise")
    public ResponseEntity<Map<String, Object>> updateEntrepriseProfile(
            HttpServletRequest request,
            @RequestBody Map<String, String> data
    ) {
        return profileService.updateEntrepriseProfile(request, data);
    }

    @PostMapping("/upload-photo")
    public ResponseEntity<Map<String, Object>> uploadPhoto(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file
    ) {
        return profileService.uploadProfilePhoto(request, file);
    }

    @PostMapping("/upload-entreprise-logo")
    public ResponseEntity<Map<String, Object>> uploadEntrepriseLogo(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file
    ) {
        return profileService.uploadEntrepriseLogo(request, file);
    }
}
