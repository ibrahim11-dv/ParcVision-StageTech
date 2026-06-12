# ParcVision — Gestion de Flotte Automobile & Archivage Intelligent (GED + OCR)

ParcVision est une plateforme web moderne et complète conçue pour simplifier la gestion de flotte automobile (véhicules, conducteurs, dépenses, interventions de maintenance) et l'archivage sécurisé de documents d'entreprise avec reconnaissance optique de caractères (OCR).

La plateforme intègre un système d'authentification robuste (JWT par cookies sécurisés) et fournit aux administrateurs de flotte un tableau de bord complet avec rapports opérationnels et financiers.

---

## Fonctionnalités Clés

### 1. Tableau de Bord et KPI
- **Vue d'ensemble en temps réel** : Statistiques sur les véhicules actifs, conducteurs disponibles, missions en cours et alertes de maintenance.
- **Synthèse financière** : Graphiques des dépenses cumulées (carburant, réparations, assurances, infractions).
- **Rapports de conformité** : Alignement avec les normes de sécurité de transport.

### 2. Gestion de la Flotte (Véhicules et Conducteurs)
- **Inventaire complet des véhicules** : Modèle, marque, immatriculation (format marocain, etc.), kilométrage, capacité de charge, et statut (Disponible, En Maintenance, En Mission, Panne).
- **Suivi des conducteurs** : Détails d'identité, numéros de permis, dates de validité et statuts de disponibilité.

### 3. Ordres de Mission et Traçage GPS
- **Planification des missions** : Création de trajets avec adresses de départ/arrivée, instructions spéciales et assignation véhicule/conducteur.
- **Suivi des colis** : Gestion des cargaisons associées à chaque mission (description, poids, volume, type de colis, code de suivi unique).
- **Simulation GPS interactive** : Visualisation cartographique (via Leaflet et OpenStreetMap) du tracé routier avec points de passage réels, détection de vitesse et géolocalisation en temps réel.

### 4. Maintenance Proactive et Incidents
- **Vidanges** : Suivi des types d'huile, viscosité, remplacement des filtres (air, huile, carburant) et coûts associés.
- **Réparations** : Détails des pièces remplacées, garages prestataires externes et états de paiement.
- **Dépannages** : Historique des pannes en route, localisation, nécessité de remorquage et gestion des dépanneurs SOS.
- **Gestion des accidents** : Saisie des lieux, contextes, niveaux de gravité (Légère/Grave), estimations budgétaires et conducteurs impliqués.

### 5. Archivage Intelligent (GED + OCR)
- **Structure de dossiers virtuelle** : Création, renommage et suppression de dossiers et sous-dossiers dans un espace d'archivage propre à chaque entreprise.
- **Reconnaissance de texte (OCR Tesseract)** : Extraction automatique et asynchrone du texte à partir d'images (JPEG, PNG, etc.) ou documents numérisés (PDF) téléchargés.
- **Recherche globale intelligente** : Moteur de recherche plein texte permettant de retrouver un document soit par son nom, soit par son **contenu extrait par OCR** (avec affichage d'un extrait de contexte surligné).

### 6. Suivi des Dépenses (Finance)
- Centralisation automatique des dépenses générées par les assurances, les amendes routières (infractions), les réparations et les vidanges payées.
- Suivi par méthode de paiement (Espèces, Carte, etc.) et identification de l'intervenant.

---

## Stack Technique

### Backend (Java & Spring Boot)
*   **Spring Boot 4.0.5** (avec `spring-boot-starter-web`)
*   **Spring Security & JWT** (gestion de session avec cookies HTTP-only sécurisés)
*   **Spring Data JPA & Hibernate** (ORM pour l'accès aux données)
*   **PostgreSQL** (base de données relationnelle)
*   **Tess4J (Tesseract OCR Java wrapper)** (reconnaissance optique de caractères)
*   **Lombok** (génération de code boilerplate)
*   **JavaFaker** (génération de données de simulation en français)

### Frontend (Web Vanilla)
*   **HTML5** / **CSS3** (système de design personnalisé, mode sombre élégant, composants modernes)
*   **JavaScript (ES6+)** (appels API asynchrones via Fetch, gestion dynamique du DOM)
*   **Bootstrap 5.3** (layout réactif)
*   **Leaflet.js** & **OpenStreetMap** (suivi GPS cartographique interactif)

---

## Prérequis de Fonctionnement

Pour exécuter ce projet localement, assurez-vous d'avoir installé :
1.  **Java JDK 17** ou version ultérieure.
2.  **Maven** 3.8+.
3.  **PostgreSQL** (avec un serveur en cours d'exécution sur le port `5432`).
4.  **Tesseract OCR** : Nécessaire pour la fonctionnalité OCR (GED).
    *   **Windows** : Télécharger l'installateur Windows officiel (ex: [UB Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki)). Par défaut, installez-le dans `C:\Program Files\Tesseract-OCR\`.
    *   **Important** : Lors de l'installation de Tesseract, assurez-vous d'inclure les données linguistiques françaises (`fra.traineddata`) ou téléchargez-les manuellement et déposez-les dans le dossier `tessdata`.

---

## Configuration du Projet

1.  Créer une base de données PostgreSQL nommée `parc_vision`.
2.  Dupliquer le fichier `src/main/resources/application-example.properties` sous le nom `src/main/resources/application.properties`.
3.  Mettre à jour les identifiants de connexion PostgreSQL et le chemin d'accès au dossier `tessdata` de Tesseract :

```properties
# Configuration Base de données
spring.datasource.url=jdbc:postgresql://localhost:5432/parc_vision
spring.datasource.username=VOTRE_UTILISATEUR
spring.datasource.password=VOTRE_MOT_DE_PASSE

# Configuration JWT
jwt.secret=METTRE_UNE_CLE_SECRETE_TRES_LONGUE_A_AU_MOINS_256_BITS
jwt.expiration=86400000

# Configuration OCR Tesseract (Chemin vers le dossier tessdata)
ocr.tessdata.path=C:/Program Files/Tesseract-OCR/tessdata

# Dossier d'upload pour les fichiers de la GED
file.upload-dir=uploads
```

---

## Lancement de l'Application

### Étape 1 : Build & Dépendances
Dans le terminal à la racine du projet, compilez le projet et téléchargez les dépendances Maven :
```bash
./mvnw clean install
```

### Étape 2 : Exécution de l'Application
Lancez le serveur Spring Boot local :
```bash
./mvnw spring-boot:run
```

Le serveur démarrera sur `http://localhost:8080`.

### Étape 3 : Accès et Données de Test (Database Seeder)
Au premier démarrage, si la base de données est vide, le système insère automatiquement des données de test réalistes via `DatabaseSeeder.java` (y compris entreprises, véhicules, conducteurs, trajets GPS, interventions et rapports).

**Identifiants par défaut générés :**
*   **Rôle Administrateur :**
    *   **Email :** `test@gmail.com`
    *   **Mot de passe :** `test123`
*   **Rôle Conducteur :**
    *   Plusieurs comptes conducteurs sont créés avec le mot de passe : `driver123`.

---

## Structure du Projet

```text
parcVision/
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/ibrahim/parcvision/
│   │   │   ├── configuration/      # Configuration Spring, CORS, et DatabaseSeeder
│   │   │   ├── controller/         # API Endpoints (REST Controllers & View Router)
│   │   │   ├── dao/                # Data Access Objects (Transfert de données)
│   │   │   ├── entity/             # Entités JPA (Accident, Assurance, Conducteur, GED, etc.)
│   │   │   ├── enums/              # Enums de statut et types de paiement
│   │   │   ├── exception/          # Centralisation des exceptions de l'application
│   │   │   ├── repository/         # Interfaces Spring Data JPA
│   │   │   ├── SecurityFilter/     # Configuration de Spring Security et filtre JWT
│   │   │   └── service/            # Logique métier (Missions, OCR, Archivage, etc.)
│   │   └── resources/
│   │       ├── static/             # Assets Frontend (HTML, CSS, JS)
│   │       │   ├── admin/          # Espace d'administration de la flotte et GED
│   │       │   ├── auth/           # Écrans de Login et Register
│   │       │   ├── home/           # Landing page du site web principal
│   │       │   └── assets/         # Images, vidéos et logos statiques
│   │       ├── application.properties
│   │       └── application-example.properties
└── pom.xml
```

---

## Sécurité et Sessions
L'application utilise un modèle de sécurité Stateless basé sur **JWT (JSON Web Tokens)** :
- Lors de l'authentification réussie, un token JWT est chiffré et stocké dans un **Cookie HttpOnly** côté navigateur.
- Ce cookie est automatiquement envoyé avec chaque requête HTTP ultérieure, protégeant l'application contre les failles XSS courantes.
- Le filtre `JwtRequestFilter` intercepte et valide le cookie pour injecter le contexte utilisateur dans Spring Security.
