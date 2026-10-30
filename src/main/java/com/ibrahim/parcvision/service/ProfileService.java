package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.ProfileMinimalInfoDao;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class ProfileService {
    UtilisateurRepository utilisateurRepository;
    AdminRepository adminRepository;
    EntrepriseRepository entrepriseRepository;
    JwtService jwtService;
    PasswordEncoder passwordEncoder;

    public ProfileService(JwtService jwtService, UtilisateurRepository utilisateurRepository, AdminRepository adminRepository, EntrepriseRepository entrepriseRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public ResponseEntity<ProfileMinimalInfoDao> getMinimalUserInfo(
            HttpServletRequest request
    ) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow();
        ProfileMinimalInfoDao reponseInfo = new ProfileMinimalInfoDao();
        reponseInfo.setEmail(user.getEmail());
        reponseInfo.setNom(user.getNom());
        reponseInfo.setPrenom(user.getPrenom());
        reponseInfo.setPhotoProfileUrl(user.getPhotoProfileUrl());
        return new ResponseEntity<>(reponseInfo, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> getAdminProfile(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        Map<String, Object> profile = new HashMap<>();
        profile.put("nom", user.getNom());
        profile.put("prenom", user.getPrenom());
        profile.put("email", user.getEmail());
        profile.put("telephone", user.getTelephone());
        profile.put("photoProfileUrl", user.getPhotoProfileUrl());
        profile.put("role", user.getRole().name());
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> updateAdminProfile(HttpServletRequest request, Map<String, String> data) {
        return updateAdminProfile(request, null, data);
    }

    public ResponseEntity<Map<String, Object>> updateAdminProfile(HttpServletRequest request, HttpServletResponse response, Map<String, String> data) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        boolean emailChanged = false;
        if (data.get("nom") != null) user.setNom(data.get("nom"));
        if (data.get("prenom") != null) user.setPrenom(data.get("prenom"));
        if (data.get("email") != null && !data.get("email").isBlank()) {
            if (!data.get("email").equals(user.getEmail())) {
                emailChanged = true;
            }
            user.setEmail(data.get("email"));
        }
        if (data.get("telephone") != null) user.setTelephone(data.get("telephone"));
        utilisateurRepository.save(user);

        if (emailChanged && response != null) {
            String newToken = jwtService.generateToken(user);
            Cookie cookie = new Cookie("jwt_token", newToken);
            cookie.setPath("/");
            cookie.setHttpOnly(true);
            cookie.setMaxAge(24 * 60 * 60);
            response.addCookie(cookie);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Profil mis à jour avec succès");
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> updatePassword(HttpServletRequest request, Map<String, String> data) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        String newPassword = data.get("newPassword");
        String confirmPassword = data.get("confirmPassword");
        if (newPassword == null || confirmPassword == null || !newPassword.equals(confirmPassword)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Les mots de passe ne correspondent pas");
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Mot de passe mis à jour avec succès");
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> getEntrepriseProfile(HttpServletRequest request) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        Entreprise entreprise = user.getEntreprise();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", entreprise.getId());
        profile.put("nom", entreprise.getNom());
        profile.put("adresse", entreprise.getAdresse());
        profile.put("telephone", entreprise.getTelephone());
        profile.put("email", entreprise.getEmail());
        profile.put("secteurActivite", entreprise.getSecteurActivite());
        profile.put("dateCreation", entreprise.getDateCreation());
        profile.put("logoUrl", entreprise.getLogoUrl());
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> updateEntrepriseProfile(HttpServletRequest request, Map<String, String> data) {
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
        Entreprise entreprise = user.getEntreprise();
        if (data.get("nom") != null) entreprise.setNom(data.get("nom"));
        if (data.get("adresse") != null) entreprise.setAdresse(data.get("adresse"));
        if (data.get("telephone") != null) entreprise.setTelephone(data.get("telephone"));
        if (data.get("email") != null) entreprise.setEmail(data.get("email"));
        if (data.get("secteurActivite") != null) entreprise.setSecteurActivite(data.get("secteurActivite"));
        if (data.get("dateCreation") != null) {
            entreprise.setDateCreation(java.time.LocalDate.parse(data.get("dateCreation")));
        }
        entrepriseRepository.save(entreprise);
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Profil entreprise mis à jour avec succès");
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<Map<String, Object>> uploadProfilePhoto(HttpServletRequest request, MultipartFile file) {
        try {
            String email = jwtService.extractEmailFromCookie(request);
            Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();

            String uploadDir = System.getProperty("user.dir") + "/uploads/profiles";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/uploads/profiles/" + filename;
            user.setPhotoProfileUrl(photoUrl);
            utilisateurRepository.save(user);

            Map<String, Object> result = new HashMap<>();
            result.put("photoUrl", photoUrl);
            result.put("message", "Photo de profil mise à jour avec succès");
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur lors du téléchargement de la photo");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<Map<String, Object>> uploadEntrepriseLogo(HttpServletRequest request, MultipartFile file) {
        try {
            String email = jwtService.extractEmailFromCookie(request);
            Utilisateur user = utilisateurRepository.findByEmail(email).orElseThrow();
            Entreprise entreprise = user.getEntreprise();

            String uploadDir = System.getProperty("user.dir") + "/uploads/entreprises";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String logoUrl = "/uploads/entreprises/" + filename;
            entreprise.setLogoUrl(logoUrl);
            entrepriseRepository.save(entreprise);

            Map<String, Object> result = new HashMap<>();
            result.put("photoUrl", logoUrl);
            result.put("message", "Logo d'entreprise mis à jour avec succès");
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur lors du téléchargement du logo");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
