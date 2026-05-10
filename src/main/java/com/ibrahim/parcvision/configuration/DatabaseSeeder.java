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

    private PasswordEncoder passwordEncoder;
    private EntrepriseRepository entrepriseRepository;
    private UtilisateurRepository utilisateurRepository;
    private AdminRepository adminRepository;

    public DatabaseSeeder(AdminRepository adminRepository ,PasswordEncoder passwordEncoder, EntrepriseRepository entrepriseRepository, UtilisateurRepository utilisateurRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            // ✅ Vérifier si les données existent déjà
            if (utilisateurRepository.findByEmail("test@gmail.com").isPresent()) {
                System.out.println("✅ Les données de test existent déjà. Seeding ignoré.");
                return;
            }

            // Création de l'entreprise
            Entreprise entreprise = new Entreprise();
            entreprise.setNom("charikat ra7a");
            entreprise.setEmail("prof@domain.com");
            entreprise.setAdresse("hay nassr");
            entreprise.setTelephone("0612345678");
            entreprise.setDateCreation(LocalDate.now());
            entreprise.setSecteurActivite("ra7a");
            entreprise = entrepriseRepository.save(entreprise);

            // Création de l'utilisateur
            Utilisateur user = new Utilisateur();
            user.setEmail("test@gmail.com");
            user.setNom("chehlafi");
            user.setPrenom("ibrahim");
            user.setRole(Role.ADMIN);
            user.setTelephone("0669462131");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setEntreprise(entreprise);
            user = utilisateurRepository.save(user);

            // Création de l'admin
            Admin admin = new Admin();
            admin.setUtilisateur(user);
            adminRepository.save(admin);

            System.out.println("Utilisateur créé avec succès !");
            System.out.println("Email: test@gmail.com");
            System.out.println("Mot de passe: test123");

        } catch (Exception e) {
            System.err.println("Erreur lors du seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
