package com.ibrahim.parcvision.configuration;

import com.github.javafaker.Faker;
import com.ibrahim.parcvision.entity.*;
import com.ibrahim.parcvision.enums.*;
import com.ibrahim.parcvision.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Random;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;
    private final EntrepriseRepository entrepriseRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AdminRepository adminRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ConducteurRepository conducteurRepository;
    private final MissionRepository missionRepository;
    private final ColisRepository colisRepository;
    private final PointGpsRepository pointGpsRepository;
    
    private final Faker faker = new Faker(new Locale("fr"));
    private final Random random = new Random();

    public DatabaseSeeder(AdminRepository adminRepository, 
                          PasswordEncoder passwordEncoder, 
                          EntrepriseRepository entrepriseRepository, 
                          UtilisateurRepository utilisateurRepository,
                          VehiculeRepository vehiculeRepository,
                          ConducteurRepository conducteurRepository,
                          MissionRepository missionRepository,
                          ColisRepository colisRepository,
                          PointGpsRepository pointGpsRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.conducteurRepository = conducteurRepository;
        this.missionRepository = missionRepository;
        this.colisRepository = colisRepository;
        this.pointGpsRepository = pointGpsRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (entrepriseRepository.count() == 0) {
            seedData();
        } else {
            System.out.println("Database already seeded.");
        }
    }

    private void seedData() {
        // 1. Seed Enterprises
        List<Entreprise> enterprises = new ArrayList<>();
        
        // First enterprise has a FIXED name to keep "uploads" folder consistent
        Entreprise defaultEnt = new Entreprise();
        defaultEnt.setNom("ParcVision_Sarl");
        defaultEnt.setEmail("contact@parcvision.com");
        defaultEnt.setAdresse("123 Rue de la Flotte, Casablanca");
        defaultEnt.setTelephone("0522001122");
        defaultEnt.setDateCreation(LocalDate.now().minusYears(2));
        defaultEnt.setSecteurActivite("Transport & Logistique");
        enterprises.add(entrepriseRepository.save(defaultEnt));

        for (int i = 0; i < 2; i++) {
            Entreprise e = new Entreprise();
            e.setNom(faker.company().name());
            e.setEmail(faker.internet().emailAddress());
            e.setAdresse(faker.address().fullAddress());
            e.setTelephone(faker.phoneNumber().phoneNumber());
            e.setDateCreation(LocalDate.now().minusYears(random.nextInt(5)));
            e.setSecteurActivite(faker.commerce().department());
            enterprises.add(entrepriseRepository.save(e));
        }

        // 2. Seed Default Admin for first enterprise
        Utilisateur defaultUser = new Utilisateur();
        defaultUser.setEmail("test@gmail.com");
        defaultUser.setNom("Chehlafi");
        defaultUser.setPrenom("Ibrahim");
        defaultUser.setRole(Role.ADMIN);
        defaultUser.setTelephone("0669462131");
        defaultUser.setPassword(passwordEncoder.encode("test123"));
        defaultUser.setEntreprise(enterprises.get(0));
        utilisateurRepository.save(defaultUser);

        Admin defaultAdmin = new Admin();
        defaultAdmin.setUtilisateur(defaultUser);
        adminRepository.save(defaultAdmin);

        // 3. Seed for each enterprise
        for (Entreprise ent : enterprises) {
            // Seed Vehicles
            List<Vehicule> vehicles = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                Vehicule v = new Vehicule();
                v.setMarque(faker.company().name());
                v.setModel(faker.commerce().productName());
                v.setImmatriculation(faker.bothify("#####-?-??"));
                v.setCapaciteChargeKg(faker.number().numberBetween(500L, 5000L));
                v.setKilometrageActuel(faker.number().numberBetween(1000L, 200000L));
                v.setTypeVehicule(TypeVehicule.values()[random.nextInt(TypeVehicule.values().length)]);
                v.setStatutVehicule(StatutVehicule.DISPONIBLE);
                v.setEntreprise(ent);
                vehicles.add(vehiculeRepository.save(v));
            }

            // Seed Conducteurs
            List<Conducteur> conducteurs = new ArrayList<>();
            for (int i = 0; i < 4; i++) {
                Utilisateur u = new Utilisateur();
                u.setEmail(faker.internet().emailAddress());
                u.setNom(faker.name().lastName());
                u.setPrenom(faker.name().firstName());
                u.setRole(Role.CONDUCTEUR);
                u.setTelephone(faker.numerify("06########"));
                u.setPassword(passwordEncoder.encode("driver123"));
                u.setEntreprise(ent);
                utilisateurRepository.save(u);

                Conducteur c = new Conducteur();
                c.setUtilisateur(u);
                c.setNumeroPermis(faker.idNumber().valid());
                c.setDateValiditePermis(LocalDate.now().plusYears(random.nextInt(10) + 1));
                c.setPhotoProfileUrl(null);
                c.setStatut(Statut.DISPONIBLE);
                conducteurs.add( conducteurRepository.save(c));
            }

            // Seed Missions
            for (int i = 0; i < 8; i++) {
                Mission m = new Mission();
                m.setReference("MSN-" + faker.number().digits(6));
                m.setEntreprise(ent);
                m.setConducteur(conducteurs.get(random.nextInt(conducteurs.size())));
                m.setVehicule(vehicles.get(random.nextInt(vehicles.size())));
                
                m.setStatut(StatutMission.values()[random.nextInt(StatutMission.values().length)]);
                m.setAdresseDepart(faker.address().city());
                m.setAdressArrivee(faker.address().city());
                m.setInstructionsSpeciales(faker.lorem().sentence());
                m.setDataDebut(faker.date().past(10, java.util.concurrent.TimeUnit.DAYS).toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
                m.setDateFinEstimee(m.getDataDebut().plusDays(random.nextInt(3) + 1));
                
                if (m.getStatut() == StatutMission.TERMINEE) {
                    m.setDateFinReelle(m.getDateFinEstimee());
                }
                
                m = missionRepository.save(m);

                // Colis
                Colis colis = new Colis();
                colis.setDescription(faker.commerce().productName());
                colis.setPoids(random.nextDouble() * 500);
                colis.setVolume(random.nextDouble() * 5);
                colis.setType(TypeColis.values()[random.nextInt(TypeColis.values().length)]);
                colis.setCodeSuivi("PKG-" + faker.number().digits(8));
                colis.setMission(m);
                colisRepository.save(colis);

                // Points GPS
                PointGPS start = new PointGPS();
                start.setLaltitude(30.0 + random.nextDouble() * 5);
                start.setLongitude(-9.0 + random.nextDouble() * 5);
                start.setTypePoint(TypePoint.DEBUT);
                start.setTimeStamp(m.getDataDebut());
                start.setMission(m);
                pointGpsRepository.save(start);

                PointGPS end = new PointGPS();
                end.setLaltitude(30.0 + random.nextDouble() * 5);
                end.setLongitude(-9.0 + random.nextDouble() * 5);
                end.setTypePoint(TypePoint.FIN);
                end.setTimeStamp(m.getDateFinEstimee());
                end.setMission(m);
                pointGpsRepository.save(end);
            }
        }
        System.out.println("Seeding completed successfully!");
    }
}
