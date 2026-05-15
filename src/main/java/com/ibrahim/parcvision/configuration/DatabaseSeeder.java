package com.ibrahim.parcvision.configuration;

import com.ibrahim.parcvision.entity.Admin;
import com.ibrahim.parcvision.entity.Conducteur;
import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
import com.ibrahim.parcvision.enums.Statut;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.ConducteurRepository;
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
    private final ConducteurRepository conducteurRepository;

    public DatabaseSeeder(AdminRepository adminRepository, PasswordEncoder passwordEncoder,
            EntrepriseRepository entrepriseRepository, UtilisateurRepository utilisateurRepository,
            ConducteurRepository conducteurRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.conducteurRepository = conducteurRepository;
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

            // Création de l'utilisateur Admin
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

            // --- Création de quelques Conducteurs pour test ---
            
            // Conducteur 1
            Utilisateur u1 = new Utilisateur();
            u1.setEmail("driver1@gmail.com");
            u1.setNom("Amrani");
            u1.setPrenom("Yassine");
            u1.setRole(Role.CONDUCTEUR);
            u1.setTelephone("0600000001");
            u1.setPassword(passwordEncoder.encode("driver123"));
            u1.setEntreprise(entreprise);
            u1 = utilisateurRepository.save(u1);

            Conducteur c1 = new Conducteur();
            c1.setUtilisateur(u1);
            c1.setNumeroPermis("A1234567");
            c1.setDateValiditePermis(LocalDate.now().plusYears(5));
            c1.setDateEmbauche(LocalDate.now().minusMonths(6));
            c1.setStatut(Statut.DISPONIBLE);
            conducteurRepository.save(c1);

            // Conducteur 2
            Utilisateur u2 = new Utilisateur();
            u2.setEmail("driver2@gmail.com");
            u2.setNom("Berrada");
            u2.setPrenom("Mehdi");
            u2.setRole(Role.CONDUCTEUR);
            u2.setTelephone("0600000002");
            u2.setPassword(passwordEncoder.encode("driver123"));
            u2.setEntreprise(entreprise);
            u2 = utilisateurRepository.save(u2);

            Conducteur c2 = new Conducteur();
            c2.setUtilisateur(u2);
            c2.setNumeroPermis("B7654321");
            c2.setDateValiditePermis(LocalDate.now().plusYears(3));
            c2.setDateEmbauche(LocalDate.now().minusYears(1));
            c2.setStatut(Statut.EN_MISSION);
            conducteurRepository.save(c2);

            System.out.println("Utilisateurs (Admin + Conducteurs) créés avec succès !");
            System.out.println("Admin Email: test@gmail.com | Password: test123");

        } catch (Exception e) {
            System.err.println("Erreur lors du seeding: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
