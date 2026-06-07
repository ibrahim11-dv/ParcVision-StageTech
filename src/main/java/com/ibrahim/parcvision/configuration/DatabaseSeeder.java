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
    private final FournisseurRepository fournisseurRepository;
    private final AssuranceRepository assuranceRepository;
    private final InfractionRepository infractionRepository;
    private final DepenseRepository depenseRepository;

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
            AccidentRepository accidentRepository,
            FournisseurRepository fournisseurRepository,
            AssuranceRepository assuranceRepository,
            InfractionRepository infractionRepository,
            DepenseRepository depenseRepository) {
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
        this.fournisseurRepository = fournisseurRepository;
        this.assuranceRepository = assuranceRepository;
        this.infractionRepository = infractionRepository;
        this.depenseRepository = depenseRepository;
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
        List<Fournisseur> fournisseurs = fournisseurRepository.findAll();
        if (vehicles.isEmpty()) return;

        for (int i = 0; i < 10; i++) {
            int type = random.nextInt(4); // 0: Reparation, 1: Depannage, 2: Vidange, 3: Accident
            Intervention intervention;
            
            Fournisseur selectedFournisseur = null;
            if (!fournisseurs.isEmpty() && random.nextBoolean()) {
                selectedFournisseur = fournisseurs.get(random.nextInt(fournisseurs.size()));
            }

            Vehicule selectedVehicule = vehicles.get(random.nextInt(vehicles.size()));

            if (type == 0) {
                Reparation r = new Reparation();
                r.setPiecesRemplacees("Plaquettes de frein, Filtres, Courroie, Bougies");
                r.setGaragePrestataire(selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : faker.company().name() + " Auto Service");
                r.setStatut("TERMINEE");
                r.setEstPaye(random.nextBoolean());
                r.setVehicule(selectedVehicule);
                if (r.getEstPaye()) {
                    r.setDatePayement(LocalDate.now().minusDays(random.nextInt(30)));
                    createDepense("Reparation", r.getCoutTotal(), r.getDatePayement(), r.getVehicule().getEntreprise());
                }
                intervention = r;
            } else if (type == 1) {
                Depannage d = new Depannage();
                d.setLieuPanne(faker.address().city());
                d.setNecessiteRemorquage(random.nextBoolean());
                d.setNomDepanneurExterne(selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : faker.company().name() + " SOS Depannage");
                d.setStatut("TERMINEE");
                d.setVehicule(selectedVehicule);
                intervention = d;
            } else if (type == 2) {
                Vidange v = new Vidange();
                v.setTypeHuile("5W-30 Synthétique");
                v.setViscosite("5W30");
                v.setFilterHuileChange(true);
                v.setFilterAirChange(random.nextBoolean());
                v.setFilterCarburantChange(random.nextBoolean());
                v.setEstPaye(random.nextBoolean());
                v.setVehicule(selectedVehicule);
                if (v.getEstPaye()) {
                    v.setDatePayement(LocalDate.now().minusDays(random.nextInt(30)));
                    createDepense("Vidange", v.getCoutTotal(), v.getDatePayement(), v.getVehicule().getEntreprise());
                }
                intervention = v;
            } else {
                Accident accident = new Accident();
                accident.setLieu(faker.address().city());
                accident.setContexte(faker.lorem().sentence());
                accident.setGravite(random.nextBoolean() ? "LEGERE" : "GRAVE");
                accident.setBudgetEstime(random.nextDouble() * 5000 + 1000);
                accident.setEtat(random.nextBoolean() ? "EN_COURS" : "TERMINEE");
                accident.setNotes(faker.lorem().paragraph());
                accident.setVehicule(selectedVehicule);
                
                if (!conducteurs.isEmpty()) {
                    List<Conducteur> candidateConducteurs = conducteurs.stream()
                            .filter(c -> c.getUtilisateur().getEntreprise().equals(selectedVehicule.getEntreprise()))
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
            // intervention.setVehicule(vehicles.get(random.nextInt(vehicles.size()))); // Removed redundant assignment
            intervention.setFournisseur(selectedFournisseur);

            Intervention savedIntervention = interventionRepository.save(intervention);

            // Create associated Depense for seeded interventions if they are "paid" or "terminé"
            if (savedIntervention.getCoutTotal() > 0) {
                String sourceCustom = "";
                String sourceType = "";
                if (savedIntervention instanceof Reparation) {
                    sourceCustom = "Reparation #" + savedIntervention.getId();
                    sourceType = "Réparation";
                } else if (savedIntervention instanceof Vidange) {
                    sourceCustom = "Vidange #" + savedIntervention.getId();
                    sourceType = "Vidange";
                } else if (savedIntervention instanceof Accident) {
                    sourceCustom = "Accident #" + savedIntervention.getId();
                    sourceType = "Accident";
                } else if (savedIntervention instanceof Depannage) {
                    sourceCustom = "Depannage #" + savedIntervention.getId();
                    sourceType = "Dépannage";
                }

                if (!sourceCustom.isEmpty()) {
                    createLinkedDepense(sourceType, sourceCustom, savedIntervention.getCoutTotal(), 
                                        savedIntervention.getDateIntervention(), savedIntervention.getVehicule().getEntreprise(),
                                        selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : "System Seeder");
                }
            }
        }
        System.out.println("Missing Interventions (including Accidents) seeded successfully!");
    }

    private void createLinkedDepense(String type, String customSource, double montant, LocalDate date, Entreprise entreprise, String qui) {
        Depense d = new Depense();
        d.setMontant(montant);
        d.setDateDepense(date);
        d.setSourceDepense(type);
        d.setSourceDepenseCustom(customSource);
        d.setQui(qui);
        d.setTypePaiement(TypePaiement.ESPECES);
        d.setEstPayee(true);
        d.setEntreprise(entreprise);
        depenseRepository.save(d);
    }

    private void createDepense(String type, double montant, LocalDate date, Entreprise entreprise) {
        Depense d = new Depense();
        d.setMontant(montant);
        d.setDateDepense(date);
        d.setSourceDepense(type);
        d.setQui("System Seeder");
        d.setTypePaiement(TypePaiement.ESPECES);
        d.setEstPayee(true);
        d.setEntreprise(entreprise);
        depenseRepository.save(d);
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

        // Seed Fournisseurs
        String[] types = {"Garage", "Station de Gazoil", "Fournisseur"};
        List<Fournisseur> fournisseurs = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Fournisseur f = new Fournisseur();
            f.setNomFournisseur(faker.company().name());
            f.setTypeFournisseur(types[random.nextInt(types.length)]);
            f.setVille(faker.address().city());
            f.setAdresse(faker.address().streetAddress());
            f.setTelephone(faker.phoneNumber().phoneNumber());
            f.setEntreprise(ent);
            fournisseurs.add(fournisseurRepository.save(f));
        }

        // Seed Vehicles
            List<Vehicule> vehicles = new ArrayList<>();
            for (int i = 0; i < 10; i++) {
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
            for (int i = 0; i < 8; i++) {
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
            for (int i = 0; i < 4; i++) {
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

                // GPS Points (Realistic trajectory in Morocco - inland focus to avoid ocean)
                double startLat = 33.4 + random.nextDouble() * 0.5; // Shifted slightly and range reduced
                double startLng = -6.4 + random.nextDouble() * 0.5; // Shifted inland (away from -7.6 which is coastal)
                double endLat = 33.8 + random.nextDouble() * 0.5;
                double endLng = -6.8 + random.nextDouble() * 0.5;

                int numWaypoints = 6; // More waypoints for complexity
                double[][] waypoints = new double[numWaypoints + 2][2];
                waypoints[0] = new double[]{startLat, startLng};
                waypoints[numWaypoints + 1] = new double[]{endLat, endLng};
                for(int w=1; w<=numWaypoints; w++) {
                    double f = (double)w / (numWaypoints + 1);
                    // Add significant but constrained deviation for a "road" feel
                    waypoints[w][0] = startLat + (endLat - startLat) * f + (random.nextDouble() - 0.5) * 0.05;
                    waypoints[w][1] = startLng + (endLng - startLng) * f + (random.nextDouble() - 0.5) * 0.05;
                }

                LocalDateTime currentTS = m.getDataDebut();

                for (int w = 0; w < waypoints.length - 1; w++) {
                    double x1 = waypoints[w][0];
                    double y1 = waypoints[w][1];
                    double x2 = waypoints[w+1][0];
                    double y2 = waypoints[w+1][1];

                    int steps = 8 + random.nextInt(7); // More points between waypoints
                    for (int s = 0; s < steps; s++) {
                        double f = (double) s / steps;
                        PointGPS p = new PointGPS();
                        // Smooth interpolation
                        p.setLaltitude(x1 + (x2 - x1) * f + (random.nextDouble() - 0.5) * 0.01);
                        p.setLongitude(y1 + (y2 - y1) * f + (random.nextDouble() - 0.5) * 0.01);
                        
                        if (w == 0 && s == 0) {
                            p.setTypePoint(TypePoint.DEPART);
                            p.setVitesse(0);
                        } else {
                            p.setTypePoint(TypePoint.EN_COURS);
                            p.setVitesse(40 + random.nextInt(51)); // 40-90 km/h
                        }
                        
                        p.setPrecisionGps(5.0 + random.nextDouble() * 3.0);
                        p.setTimeStamp(currentTS);
                        p.setMission(m);
                        pointGpsRepository.save(p);
                        
                        currentTS = currentTS.plusMinutes(random.nextInt(4) + 2); // Varying intervals
                    }
                }

                // Final point
                PointGPS end = new PointGPS();
                end.setLaltitude(endLat);
                end.setLongitude(endLng);
                end.setTypePoint(TypePoint.ARRIVEE);
                end.setVitesse(0);
                end.setPrecisionGps(5.0);
                end.setTimeStamp(currentTS);
                end.setMission(m);
                pointGpsRepository.save(end);

                // Update mission dates based on points if needed
                if (m.getStatut() == StatutMission.TERMINEE) {
                    m.setDateFinReelle(currentTS);
                    missionRepository.save(m);
                }
            }

            // Seed Interventions for this enterprise
            seedMissingInterventions();

            // Seed Assurances and Infractions
            for (Vehicule v : vehicles) {
                // Seed Assurance
                if (random.nextBoolean()) {
                    Assurance a = new Assurance();
                    a.setVehicule(v);
                    a.setTypeAssurance("Tous risques");
                    a.setDateDebut(LocalDate.now().minusMonths(6));
                    a.setDateExpiration(LocalDate.now().plusMonths(6));
                    a.setMontant(random.nextDouble() * 1000 + 500);
                    a.setEstPayee(random.nextBoolean());
                    if (a.getEstPayee()) {
                        a.setDatePaiement(a.getDateDebut());
                        createDepense("Assurance", a.getMontant(), a.getDatePaiement(), ent);
                    }
                    assuranceRepository.save(a);
                }

                // Seed Infraction
                if (random.nextBoolean()) {
                    Infraction inf = new Infraction();
                    inf.setVehicule(v);
                    inf.setEntreprise(ent);
                    inf.setCategorie("Excès de vitesse");
                    inf.setMontant(random.nextDouble() * 500 + 100);
                    inf.setEstPayee(random.nextBoolean());
                    if (inf.getEstPayee()) {
                        inf.setDatePaiement(LocalDate.now().minusDays(random.nextInt(30)));
                        createDepense("Infraction", inf.getMontant(), inf.getDatePaiement(), ent);
                    }
                    infractionRepository.save(inf);
                }
            }
        
        System.out.println("Seeding completed successfully!");
    }
}
