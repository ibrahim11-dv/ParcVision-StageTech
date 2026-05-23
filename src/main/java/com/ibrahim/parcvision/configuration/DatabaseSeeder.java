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
    private final InterventionRepository interventionRepository;
    private final AccidentRepository accidentRepository;

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
            PointGpsRepository pointGpsRepository,
            InterventionRepository interventionRepository,
            AccidentRepository accidentRepository) {
        this.passwordEncoder = passwordEncoder;
        this.entrepriseRepository = entrepriseRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.conducteurRepository = conducteurRepository;
        this.missionRepository = missionRepository;
        this.colisRepository = colisRepository;
        this.pointGpsRepository = pointGpsRepository;
        this.interventionRepository = interventionRepository;
        this.accidentRepository = accidentRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (entrepriseRepository.count() == 0) {
            seedData();
        } 
        
        if (interventionRepository.count() == 0) {
            System.out.println("Ajout des interventions manquantes (y compris accidents)...");
            seedMissingInterventions();
        } 
        
        if (entrepriseRepository.count() > 0 && interventionRepository.count() > 0) {
            System.out.println("Database already seeded.");
        }
    }

    private void seedMissingInterventions() {
        List<Vehicule> vehicles = vehiculeRepository.findAll();
        List<Conducteur> conducteurs = conducteurRepository.findAll();
        if (vehicles.isEmpty()) return;

        for (int i = 0; i < 200; i++) {
            int type = random.nextInt(4); // 0: Reparation, 1: Depannage, 2: Vidange, 3: Accident
            Intervention intervention;
            
            if (type == 0) {
                Reparation r = new Reparation();
                r.setPiecesRemplacees("Plaquettes de frein, Filtres, Courroie, Bougies");
                r.setGaragePrestataire(faker.company().name() + " Auto Service");
                r.setStatut("TERMINEE");
                r.setEstPaye(random.nextBoolean());
                if (r.getEstPaye()) {
                    r.setDatePayement(LocalDate.now().minusDays(random.nextInt(30)));
                }
                intervention = r;
            } else if (type == 1) {
                Depannage d = new Depannage();
                d.setLieuPanne(faker.address().city());
                d.setNecessiteRemorquage(random.nextBoolean());
                d.setNomDepanneurExterne(faker.company().name() + " SOS Depannage");
                d.setStatut("TERMINEE");
                intervention = d;
            } else if (type == 2) {
                Vidange v = new Vidange();
                v.setTypeHuile("5W-30 Synthétique");
                v.setViscosite("5W30");
                v.setFilterHuileChange(true);
                v.setFilterAirChange(random.nextBoolean());
                v.setFilterCarburantChange(random.nextBoolean());
                intervention = v;
            } else {
                Accident accident = new Accident();
                accident.setLieu(faker.address().city());
                accident.setContexte(faker.lorem().sentence());
                accident.setGravite(random.nextBoolean() ? "LEGERE" : "GRAVE");
                accident.setBudgetEstime(random.nextDouble() * 5000 + 1000);
                accident.setEtat(random.nextBoolean() ? "EN_COURS" : "TERMINEE");
                accident.setNotes(faker.lorem().paragraph());
                
                if (!conducteurs.isEmpty()) {
                    Vehicule v = vehicles.get(random.nextInt(vehicles.size()));
                    List<Conducteur> candidateConducteurs = conducteurs.stream()
                            .filter(c -> c.getUtilisateur().getEntreprise().equals(v.getEntreprise()))
                            .toList();
                    if (!candidateConducteurs.isEmpty()) {
                        accident.setConducteur(candidateConducteurs.get(random.nextInt(candidateConducteurs.size())));
                    } else {
                        accident.setConducteur(conducteurs.get(random.nextInt(conducteurs.size())));
                    }
                }
                intervention = accident;
            }

            intervention.setDateIntervention(LocalDate.now().minusDays(random.nextInt(365)));
            intervention.setDescriptionPanne(faker.lorem().sentence());
            intervention.setActionsMenees(faker.lorem().sentence());
            intervention.setCoutTotal(random.nextDouble() * 200 + 300);
            intervention.setKilometrageAuMoment((long) random.nextInt(200000) + 5000);
            intervention.setVehicule(vehicles.get(random.nextInt(vehicles.size())));

            interventionRepository.save(intervention);
        }
        System.out.println("Missing Interventions (including Accidents) seeded successfully!");
    }

    private void seedData() {
        // 1. Seed Enterprise
        Entreprise defaultEnt = new Entreprise();
        defaultEnt.setNom("ParcVision_Sarl");
        defaultEnt.setEmail("contact@parcvision.com");
        defaultEnt.setAdresse("123 Rue de la Flotte, Casablanca");
        defaultEnt.setTelephone("0522001122");
        defaultEnt.setDateCreation(LocalDate.now().minusYears(2));
        defaultEnt.setSecteurActivite("Transport & Logistique");
        defaultEnt = entrepriseRepository.save(defaultEnt);

        // 2. Seed Default Admin
        Utilisateur defaultUser = new Utilisateur();
        defaultUser.setEmail("test@gmail.com");
        defaultUser.setNom("Chehlafi");
        defaultUser.setPrenom("Ibrahim");
        defaultUser.setRole(Role.ADMIN);
        defaultUser.setTelephone("0669462131");
        defaultUser.setPassword(passwordEncoder.encode("test123"));
        defaultUser.setEntreprise(defaultEnt);
        utilisateurRepository.save(defaultUser);

        Admin defaultAdmin = new Admin();
        defaultAdmin.setUtilisateur(defaultUser);
        adminRepository.save(defaultAdmin);

        // 3. Seed Data for the Enterprise
        Entreprise ent = defaultEnt;
        // Seed Vehicles
            List<Vehicule> vehicles = new ArrayList<>();
            for (int i = 0; i < 30; i++) {
                Vehicule v = new Vehicule();
                v.setMarque(faker.company().name());
                v.setModel(faker.commerce().productName());
                v.setImmatriculation(faker.bothify("#####-?-??"));
                v.setCapaciteChargeKg(faker.number().numberBetween(500L, 10000L));
                v.setKilometrageActuel(faker.number().numberBetween(100L, 300000L));
                v.setTypeVehicule(TypeVehicule.values()[random.nextInt(TypeVehicule.values().length)]);
                v.setStatutVehicule(StatutVehicule.values()[random.nextInt(StatutVehicule.values().length)]);
                v.setEntreprise(ent);
                vehicles.add(vehiculeRepository.save(v));
            }

            // Seed Conducteurs
            List<Conducteur> conducteurs = new ArrayList<>();
            for (int i = 0; i < 20; i++) {
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
                c.setStatut(Statut.values()[random.nextInt(Statut.values().length)]);
                conducteurs.add(conducteurRepository.save(c));
            }

            // Seed Missions
            for (int i = 0; i < 30; i++) {
                Mission m = new Mission();
                m.setReference("MSN-" + faker.number().digits(6));
                m.setEntreprise(ent);
                m.setConducteur(conducteurs.get(random.nextInt(conducteurs.size())));
                m.setVehicule(vehicles.get(random.nextInt(vehicles.size())));

                m.setStatut(StatutMission.values()[random.nextInt(StatutMission.values().length)]);
                m.setAdresseDepart(faker.address().city());
                m.setAdressArrivee(faker.address().city());
                m.setInstructionsSpeciales(faker.lorem().sentence());
                m.setDataDebut(faker.date().past(30, java.util.concurrent.TimeUnit.DAYS).toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDateTime());
                m.setDateFinEstimee(m.getDataDebut().plusDays(random.nextInt(5) + 1));

                if (m.getStatut() == StatutMission.TERMINEE) {
                    m.setDateFinReelle(m.getDateFinEstimee().plusHours(random.nextInt(4)));
                }

                m = missionRepository.save(m);

                // Colis (1 to 3 per mission)
                int numColis = random.nextInt(3) + 1;
                for (int j = 0; j < numColis; j++) {
                    Colis colis = new Colis();
                    colis.setDescription(faker.commerce().productName());
                    colis.setPoids(random.nextDouble() * 1000);
                    colis.setVolume(random.nextDouble() * 10);
                    colis.setType(TypeColis.values()[random.nextInt(TypeColis.values().length)]);
                    colis.setCodeSuivi("PKG-" + faker.number().digits(10));
                    colis.setMission(m);
                    colisRepository.save(colis);
                }

                // Points GPS (Start, End, and some intermediate)
                PointGPS start = new PointGPS();
                start.setLaltitude(30.0 + random.nextDouble() * 5);
                start.setLongitude(-9.0 + random.nextDouble() * 5);
                start.setTypePoint(TypePoint.DEBUT);
                start.setTimeStamp(m.getDataDebut());
                start.setMission(m);
                pointGpsRepository.save(start);

                // Add 1-2 intermediate points
                int numIntermediate = random.nextInt(2) + 1;
                for (int k = 0; k < numIntermediate; k++) {
                    PointGPS mid = new PointGPS();
                    mid.setLaltitude(30.0 + random.nextDouble() * 5);
                    mid.setLongitude(-9.0 + random.nextDouble() * 5);
                    mid.setTypePoint(TypePoint.AVANCEMENT);
                    mid.setTimeStamp(m.getDataDebut().plusHours(random.nextInt(12) + 1));
                    mid.setMission(m);
                    pointGpsRepository.save(mid);
                }

                PointGPS end = new PointGPS();
                end.setLaltitude(30.0 + random.nextDouble() * 5);
                end.setLongitude(-9.0 + random.nextDouble() * 5);
                end.setTypePoint(TypePoint.FIN);
                end.setTimeStamp(m.getStatut() == StatutMission.TERMINEE ? m.getDateFinReelle() : m.getDateFinEstimee());
                end.setMission(m);
                pointGpsRepository.save(end);
            }

            // Seed Interventions for this enterprise
            seedMissingInterventions();
        
        System.out.println("Seeding completed successfully!");
    }
}
