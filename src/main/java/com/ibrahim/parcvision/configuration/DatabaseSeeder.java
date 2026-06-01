package com.ibrahim.parcvision.configuration;

import com.ibrahim.parcvision.entity.Admin;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    private final EntrepriseRepository entrepriseRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AdminRepository adminRepository;

    public DatabaseSeeder(AdminRepository adminRepository,
                          PasswordEncoder passwordEncoder,
                          EntrepriseRepository entrepriseRepository,
                          UtilisateurRepository utilisateurRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public void run(String... args) {
        try {
            // Check if user already exists to skip seeding
            boolean userExists = utilisateurRepository.findByEmail("test@gmail.com").isPresent();
            if (userExists) {
                System.out.println("Data Seeding Skipped: User test@gmail.com already exists.");
                return;
            }

            Entreprise entreprise;
            try {
                entreprise = entrepriseRepository.findByAdresse("hay nassr").orElse(null);
            } catch (Exception e) {
                System.out.println("Error checking existing entreprise: " + e.getMessage());
                entreprise = null;
            }

            if (entreprise == null) {
                entreprise = new Entreprise();
                entreprise.setNom("charikat ra7a");
                entreprise.setEmail("prof@domain.com");
                entreprise.setAdresse("hay nassr");
                entreprise.setTelephone("0612345678");
                entreprise.setDateCreation(LocalDate.now());
                entreprise.setSecteurActivite("ra7a");
                entreprise = entrepriseRepository.save(entreprise);
                System.out.println("Created new entreprise");
            } else {
                System.out.println("Entreprise already exists with ID: " + entreprise.getId());
            }

            Utilisateur user = new Utilisateur();
            user.setEmail("test@gmail.com");
            user.setNom("chehlafi");
            user.setPrenom("ibrahim");
            user.setRole(Role.ADMIN);
            user.setTelephone("0669462131");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setEntreprise(entreprise);
            user = utilisateurRepository.save(user);

            Admin admin = new Admin();
            admin.setUtilisateur(user);
            adminRepository.save(admin);

            System.out.println("Created new user and admin");
            System.out.println("Data Seeding Completed !!!");
        } catch (Exception e) {
            System.err.println("Data Seeding Failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}