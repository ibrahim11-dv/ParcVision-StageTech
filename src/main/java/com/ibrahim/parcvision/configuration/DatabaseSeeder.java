package com.ibrahim.parcvision.configuration;

import com.ibrahim.parcvision.entity.Entreprise;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.enums.Role;
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

    public DatabaseSeeder(PasswordEncoder passwordEncoder, EntrepriseRepository entrepriseRepository, UtilisateurRepository utilisateurRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        try{
            Entreprise entreprise = new Entreprise();
            entreprise.setNom("charikat ra7a");
            entreprise.setEmail("prof@domain.com");
            entreprise.setAdresse("hay nassr");
            entreprise.setTelephone("0612345678");
            entreprise.setDateCreation(LocalDate.now());
            entreprise.setSecteurActivite("ra7a");
            entreprise = entrepriseRepository.save(entreprise);
            Utilisateur user = new Utilisateur();
            user.setEmail("test@gmail.com");
            user.setNom("chehlafi");
            user.setPrenom("ibrahim");
            user.setRole(Role.ADMIN);
            user.setTelephone("0669462131");
            user.setPassword(passwordEncoder.encode("test123"));
            user.setEntreprise(entreprise);
            utilisateurRepository.save(user);
            System.out.println("User Created !!!");

        }catch (Exception e){
            e.printStackTrace();
            System.out.println("User not Created ???");
        }


    }
}
