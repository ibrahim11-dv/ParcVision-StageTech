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
    private final DossierArchivageRepository dossierArchivageRepository;

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
                          DepenseRepository depenseRepository,
                          DossierArchivageRepository dossierArchivageRepository) {
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
        this.dossierArchivageRepository = dossierArchivageRepository;
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

        // Ensure initial archive folders exist for all enterprises
        for (Entreprise ent : entrepriseRepository.findAll()) {
            seedInitialArchiveFolders(ent);
        }

        if (entrepriseRepository.count() > 0 && interventionRepository.count() > 0) {
            System.out.println("Database already seeded.");
        }
    }

    private void seedInitialArchiveFolders(Entreprise ent) {
        DossierArchivage root = dossierArchivageRepository
                .findByEntrepriseAndParentIsNullAndNom(ent, "/")
                .orElseGet(() -> dossierArchivageRepository.save(new DossierArchivage("/", "/", null, ent)));

        List<DossierArchivage> children = dossierArchivageRepository.findByParent(root, org.springframework.data.domain.Sort.unsorted());
        if (children.isEmpty()) {
            String[] defaultFolders = {
                    "Factures & Devis",
                    "Assurances & Contrats",
                    "Rapports d'Intervention",
                    "Documents Véhicules"
            };
            for (String folderName : defaultFolders) {
                dossierArchivageRepository.save(new DossierArchivage(folderName, "/" + folderName, root, ent));
            }
        }
    }

    private void seedMissingInterventions() {
        List<Vehicule> vehicles = vehiculeRepository.findAll();
        List<Conducteur> conducteurs = conducteurRepository.findAll();
        List<Fournisseur> fournisseurs = fournisseurRepository.findAll();
        if (vehicles.isEmpty()) return;

        String[] statutsIntervention = {"En cours", "Terminé", "En attente"};
        String[] etatsAccident = {"En réparation", "En expertise", "Réparé"};
        String[] gravitesAccident = {"mineur", "moyenne", "tres-grave"};

        for (int i = 0; i < 10; i++) {
            int type = random.nextInt(4); // 0: Reparation, 1: Depannage, 2: Vidange, 3: Accident
            Intervention intervention;

            Fournisseur selectedFournisseur = null;
            if (!fournisseurs.isEmpty() && random.nextBoolean()) {
                selectedFournisseur = fournisseurs.get(random.nextInt(fournisseurs.size()));
            }

            Vehicule selectedVehicule = vehicles.get(random.nextInt(vehicles.size()));
            double cout = Math.round((random.nextDouble() * 800 + 300) * 100.0) / 100.0;
            boolean isPaid = random.nextBoolean();

            if (type == 0) {
                Reparation r = new Reparation();
                r.setPiecesRemplacees("Plaquettes de frein, Filtres, Courroie, Bougies");
                r.setGaragePrestataire(selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : faker.company().name() + " Auto Service");
                r.setStatut(statutsIntervention[random.nextInt(statutsIntervention.length)]);
                r.setEstPaye(isPaid);
                r.setVehicule(selectedVehicule);
                if (isPaid) {
                    r.setDatePayement(LocalDate.now().minusDays(random.nextInt(30)));
                }
                intervention = r;
            } else if (type == 1) {
                Depannage d = new Depannage();
                d.setLieuPanne(faker.address().city());
                d.setNecessiteRemorquage(random.nextBoolean());
                d.setNomDepanneurExterne(selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : faker.company().name() + " SOS Dépannage");
                d.setStatut(statutsIntervention[random.nextInt(statutsIntervention.length)]);
                d.setVehicule(selectedVehicule);
                intervention = d;
            } else if (type == 2) {
                Vidange v = new Vidange();
                v.setTypeHuile("5W-30 Synthétique");
                v.setViscosite("5W30");
                v.setFilterHuileChange(true);
                v.setFilterAirChange(random.nextBoolean());
                v.setFilterCarburantChange(random.nextBoolean());
                v.setEstPaye(isPaid);
                v.setVehicule(selectedVehicule);
                if (isPaid) {
                    v.setDatePayement(LocalDate.now().minusDays(random.nextInt(30)));
                }
                intervention = v;
            } else {
                Accident accident = new Accident();
                accident.setLieu(faker.address().city());
                accident.setContexte(faker.lorem().sentence());
                accident.setGravite(gravitesAccident[random.nextInt(gravitesAccident.length)]);
                double budget = Math.round((random.nextDouble() * 5000 + 1000) * 100.0) / 100.0;
                accident.setBudgetEstime(budget);
                cout = budget;
                accident.setEtat(etatsAccident[random.nextInt(etatsAccident.length)]);
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

            intervention.setDateIntervention(LocalDate.now().minusDays(random.nextInt(180)));
            intervention.setDescriptionPanne(faker.lorem().sentence());
            intervention.setActionsMenees(faker.lorem().sentence());
            intervention.setCoutTotal(cout);
            long vehKm = selectedVehicule.getKilometrageActuel() != null ? selectedVehicule.getKilometrageActuel() : 50000L;
            intervention.setKilometrageAuMoment(Math.max(1000L, vehKm - random.nextInt(12000)));
            intervention.setFournisseur(selectedFournisseur);

            Intervention savedIntervention = interventionRepository.save(intervention);

            if (savedIntervention.getCoutTotal() > 0) {
                String sourceCustom = "";
                String sourceType = "";
                String provider = selectedFournisseur != null ? selectedFournisseur.getNomFournisseur() : "Garage Partenaire";
                if (savedIntervention instanceof Reparation rep) {
                    sourceCustom = "Reparation #" + savedIntervention.getId();
                    sourceType = "Réparation";
                    if (rep.getGaragePrestataire() != null) provider = rep.getGaragePrestataire();
                } else if (savedIntervention instanceof Vidange) {
                    sourceCustom = "Vidange #" + savedIntervention.getId();
                    sourceType = "Vidange";
                } else if (savedIntervention instanceof Accident acc) {
                    sourceCustom = "Accident #" + savedIntervention.getId();
                    sourceType = "Accident";
                    if (acc.getConducteur() != null && acc.getConducteur().getUtilisateur() != null) {
                        provider = "Conducteur: " + acc.getConducteur().getUtilisateur().getNom() + " " + acc.getConducteur().getUtilisateur().getPrenom();
                    }
                } else if (savedIntervention instanceof Depannage dep) {
                    sourceCustom = "Dépannage #" + savedIntervention.getId();
                    sourceType = "Dépannage";
                    if (dep.getNomDepanneurExterne() != null) provider = dep.getNomDepanneurExterne();
                }

                if (!sourceCustom.isEmpty()) {
                    createLinkedDepense(sourceType, sourceCustom, savedIntervention.getCoutTotal(),
                            savedIntervention.getDateIntervention(), savedIntervention.getVehicule().getEntreprise(),
                            provider, isPaid);
                }
            }
        }
        System.out.println("Missing Interventions (including Accidents) seeded successfully!");
    }

    private void createLinkedDepense(String type, String customSource, double montant, LocalDate date, Entreprise entreprise, String qui, boolean estPayee) {
        Depense d = new Depense();
        d.setMontant(Math.round(montant * 100.0) / 100.0);
        d.setDateDepense(date);
        d.setSourceDepense(type);
        d.setSourceDepenseCustom(customSource);
        d.setQui(qui);
        d.setTypePaiement(random.nextBoolean() ? TypePaiement.CARTE_CREDIT : TypePaiement.ESPECES);
        d.setEstPayee(estPayee);
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
        defaultUser.setCin("BK123456");
        defaultUser.setDateNaissance(LocalDate.of(1998, 5, 15));
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
        String[] carburants = {"Diesel", "Essence", "Hybride", "Électrique"};
        List<Vehicule> vehicles = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Vehicule v = new Vehicule();
            v.setMarque(faker.company().name());
            v.setModel(faker.commerce().productName());
            v.setImmatriculation(faker.bothify("#####-?-??").toUpperCase());
            v.setCarburant(carburants[random.nextInt(carburants.length)]);
            v.setCapaciteChargeKg(faker.number().numberBetween(500L, 10000L));
            v.setKilometrageActuel(faker.number().numberBetween(15000L, 250000L));
            v.setDateMiseCirculation(LocalDate.now().minusYears(random.nextInt(6) + 1));
            v.setDateExpirationAssurance(LocalDate.now().plusMonths(random.nextInt(12) - 2));
            v.setDateProchainControleTechnique(LocalDate.now().plusMonths(random.nextInt(12) - 1));
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
            u.setCin(faker.bothify("??######").toUpperCase());
            u.setDateNaissance(LocalDate.now().minusYears(25 + random.nextInt(25)));
            u.setRole(Role.CONDUCTEUR);
            u.setTelephone(faker.numerify("06########"));
            u.setPassword(passwordEncoder.encode("driver123"));
            u.setEntreprise(ent);
            utilisateurRepository.save(u);

            Conducteur c = new Conducteur();
            c.setUtilisateur(u);
            c.setNumeroPermis(faker.numerify("PRM-########"));
            c.setDateValiditePermis(LocalDate.now().plusYears(random.nextInt(8) + 1));
            c.setDateEmbauche(LocalDate.now().minusMonths(random.nextInt(36) + 1));
            c.setPhotoProfileUrl(null);
            c.setStatut(Statut.values()[random.nextInt(Statut.values().length)]);
            conducteurs.add(conducteurRepository.save(c));
        }

        // Seed Missions
        List<Mission> savedMissions = new ArrayList<>();
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
            savedMissions.add(m);

            // Colis (1 to 3 per mission)
            int numColis = random.nextInt(3) + 1;
            for (int j = 0; j < numColis; j++) {
                Colis colis = new Colis();
                colis.setDescription(faker.commerce().productName());
                colis.setPoids(Math.round(random.nextDouble() * 1000 * 10.0) / 10.0);
                colis.setVolume(Math.round(random.nextDouble() * 10 * 10.0) / 10.0);
                colis.setType(TypeColis.values()[random.nextInt(TypeColis.values().length)]);
                colis.setCodeSuivi("PKG-" + faker.number().digits(10));
                colis.setMission(m);
                colisRepository.save(colis);
            }

            // GPS Points
            double startLat = 33.4 + random.nextDouble() * 0.5;
            double startLng = -6.4 + random.nextDouble() * 0.5;
            double endLat = 33.8 + random.nextDouble() * 0.5;
            double endLng = -6.8 + random.nextDouble() * 0.5;

            int numWaypoints = 6;
            double[][] waypoints = new double[numWaypoints + 2][2];
            waypoints[0] = new double[]{startLat, startLng};
            waypoints[numWaypoints + 1] = new double[]{endLat, endLng};
            for (int w = 1; w <= numWaypoints; w++) {
                double f = (double) w / (numWaypoints + 1);
                waypoints[w][0] = startLat + (endLat - startLat) * f + (random.nextDouble() - 0.5) * 0.05;
                waypoints[w][1] = startLng + (endLng - startLng) * f + (random.nextDouble() - 0.5) * 0.05;
            }

            LocalDateTime currentTS = m.getDataDebut();

            for (int w = 0; w < waypoints.length - 1; w++) {
                double x1 = waypoints[w][0];
                double y1 = waypoints[w][1];
                double x2 = waypoints[w + 1][0];
                double y2 = waypoints[w + 1][1];

                int steps = 8 + random.nextInt(7);
                for (int s = 0; s < steps; s++) {
                    double f = (double) s / steps;
                    PointGPS p = new PointGPS();
                    p.setLaltitude(x1 + (x2 - x1) * f + (random.nextDouble() - 0.5) * 0.01);
                    p.setLongitude(y1 + (y2 - y1) * f + (random.nextDouble() - 0.5) * 0.01);

                    if (w == 0 && s == 0) {
                        p.setTypePoint(TypePoint.DEPART);
                        p.setVitesse(0);
                    } else {
                        p.setTypePoint(TypePoint.EN_COURS);
                        p.setVitesse(40 + random.nextInt(51));
                    }

                    p.setPrecisionGps(5.0 + random.nextDouble() * 3.0);
                    p.setTimeStamp(currentTS);
                    p.setMission(m);
                    pointGpsRepository.save(p);

                    currentTS = currentTS.plusMinutes(random.nextInt(4) + 2);
                }
            }

            PointGPS end = new PointGPS();
            end.setLaltitude(endLat);
            end.setLongitude(endLng);
            end.setTypePoint(TypePoint.ARRIVEE);
            end.setVitesse(0);
            end.setPrecisionGps(5.0);
            end.setTimeStamp(currentTS);
            end.setMission(m);
            pointGpsRepository.save(end);

            if (m.getStatut() == StatutMission.TERMINEE) {
                m.setDateFinReelle(currentTS);
                missionRepository.save(m);
            }
        }

        // Seed Interventions for this enterprise
        seedMissingInterventions();

        // Seed Assurances and Infractions
        String[] assureurs = {"AXA Assurance Maroc", "Wafa Assurance", "RMA Watanya", "Sanlam Maroc", "AtlantaSanad"};
        String[] categoriesInfraction = {"Excès de vitesse", "Stationnement interdit", "Feu rouge grillé", "Défaut de contrôle technique"};
        for (Vehicule v : vehicles) {
            if (random.nextBoolean()) {
                Assurance a = new Assurance();
                a.setVehicule(v);
                a.setTypeAssurance("Tous risques");
                a.setNomPrestataire(assureurs[random.nextInt(assureurs.length)]);
                a.setNombreMois(12);
                a.setDateDebut(LocalDate.now().minusMonths(6));
                a.setDateExpiration(LocalDate.now().plusMonths(6));
                a.setMontant(Math.round((random.nextDouble() * 3000 + 2500) * 100.0) / 100.0);
                boolean paid = random.nextBoolean();
                a.setEstPayee(paid);
                if (paid) {
                    a.setDatePaiement(a.getDateDebut());
                }
                a = assuranceRepository.save(a);
                createLinkedDepense("Assurance", "Assurance #" + a.getId(), a.getMontant(),
                        a.getDateDebut(), ent, a.getNomPrestataire(), paid);
            }

            if (random.nextBoolean()) {
                Infraction inf = new Infraction();
                inf.setVehicule(v);
                inf.setEntreprise(ent);
                if (!conducteurs.isEmpty()) {
                    inf.setConducteur(conducteurs.get(random.nextInt(conducteurs.size())));
                }
                if (!savedMissions.isEmpty() && random.nextBoolean()) {
                    inf.setMission(savedMissions.get(random.nextInt(savedMissions.size())));
                }
                String cat = categoriesInfraction[random.nextInt(categoriesInfraction.length)];
                inf.setCategorie(cat);
                inf.setDescription("Infraction constatée : " + cat + " sur route nationale.");
                LocalDate dateCommis = LocalDate.now().minusDays(random.nextInt(45) + 5);
                inf.setDateCommis(dateCommis);
                inf.setDateLimitePaiement(dateCommis.plusDays(30));
                inf.setMontant(Math.round((random.nextDouble() * 500 + 150) * 100.0) / 100.0);
                boolean paid = random.nextBoolean();
                inf.setEstPayee(paid);
                if (paid) {
                    inf.setDatePaiement(dateCommis.plusDays(random.nextInt(10) + 1));
                }
                inf = infractionRepository.save(inf);
                createLinkedDepense("Infraction", "Infraction #" + inf.getId(), inf.getMontant(),
                        inf.getDateCommis(), ent, "Amende — " + cat, paid);
            }
        }

        // Seed Initial Archive Folders
        seedInitialArchiveFolders(ent);

        System.out.println("Seeding completed successfully!");
    }
}
