package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.RegistrationRequestDao;
import com.ibrahim.parcvision.entity.Admin;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
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
    private AdminRepository adminRepository;
    private EntrepriseRepository entrepriseRepository;
    private UtilisateurRepository utilisateurRepository;
    private PasswordEncoder passwordEncoder;

    public RegistrationController(AdminRepository adminRepository, EntrepriseRepository entrepriseRepository, UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register-Enterprise")
    public ResponseEntity<?> registerEntreprise(
            @Valid @RequestBody RegistrationRequestDao registrationRequestDao,
            BindingResult bindingResult
    ){
        if (bindingResult.hasErrors()) {
            StringBuilder errors = new StringBuilder();
            bindingResult.getAllErrors().forEach(error ->
                    errors.append(error.getDefaultMessage()).append("; ")
            );
            return ResponseEntity.badRequest().body(errors.toString());
        }

        try {
            if (entrepriseRepository.existsByNom(registrationRequestDao.getEntrepriseNom())) {
                return ResponseEntity.badRequest().body("Nom d'entreprise déjà utilisé");
            }

            if (entrepriseRepository.existsByEmail(registrationRequestDao.getEntrepriseEmail())) {
                return ResponseEntity.badRequest().body("Email d'entreprise déjà utilisé");
            }

            if (entrepriseRepository.existsByTelephone(registrationRequestDao.getEntrepriseTelephone())) {
                return ResponseEntity.badRequest().body("Téléphone d'entreprise déjà utilisé");
            }
            if (entrepriseRepository.existsByAdresse(registrationRequestDao.getEntrepriseAdresse())) {
                return ResponseEntity.badRequest().body("adresse d'entreprise déjà utilisé");
            }
            if(!registrationRequestDao.getEntrepriseTelephone().matches("^(06|07|05)\\d{8}$")){
                return ResponseEntity.badRequest().body("numero de telephone ne pas valide");
            }

            Entreprise entreprise = new Entreprise();
            entreprise.setNom(registrationRequestDao.getEntrepriseNom());
            entreprise.setEmail(registrationRequestDao.getEntrepriseEmail());
            entreprise.setAdresse(registrationRequestDao.getEntrepriseAdresse());
            entreprise.setTelephone(registrationRequestDao.getEntrepriseTelephone());
            entreprise.setSecteurActivite(registrationRequestDao.getEntrepriseSecteurActivite());
            entreprise.setDateCreation(registrationRequestDao.getEntrepriseDateCreation());

            if (utilisateurRepository.findByEmail(registrationRequestDao.getAdminEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Email d'administrateur déjà utilisé");
            }

            Utilisateur utilisateur = new Utilisateur();
            utilisateur.setNom(registrationRequestDao.getAdminNom());
            utilisateur.setPrenom(registrationRequestDao.getAdminPrenom());
            utilisateur.setEmail(registrationRequestDao.getAdminEmail());
            utilisateur.setTelephone(registrationRequestDao.getEntrepriseTelephone());
            utilisateur.setRole(Role.ADMIN);
            utilisateur.setPassword(passwordEncoder.encode(registrationRequestDao.getAdminPassword()));
            utilisateur.setEntreprise(entreprise);

            Admin admin = new Admin();
            admin.setUtilisateur(utilisateur);

            entreprise = entrepriseRepository.save(entreprise);
            utilisateur = utilisateurRepository.save(utilisateur);
            adminRepository.save(admin);

            return ResponseEntity.ok("Registration successful");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

}
