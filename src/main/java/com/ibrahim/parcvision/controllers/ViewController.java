package com.ibrahim.parcvision.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    // ── Home ──────────────────────────────────────────────────────────────────
    @GetMapping("/")
    public String home() {
        return "forward:/home/html/index.html";
    }

    // ── Auth ──────────────────────────────────────────────────────────────────
    @GetMapping("/login")
    public String login() {
        return "forward:/auth/html/login.html";
    }

    @GetMapping("/register")
    public String register() {
        return "forward:/auth/html/register.html";
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "forward:/admin/html/dashboard.html";
    }

    @GetMapping("/admin/conducteurs")
    public String adminConducteurs() {
        return "forward:/admin/html/conducteur.html";
    }

    @GetMapping("/admin/vehicules")
    public String adminVehicules() {
        return "forward:/admin/html/vehicule.html";
    }

    @GetMapping("/admin/gps")
    public String adminGps() {
        return "forward:/admin/html/suivi-gps.html";
    }

    @GetMapping("/admin/reparations")
    public String adminReparations() {
        return "forward:/admin/html/reparation.html";
    }

    @GetMapping("/admin/accidents")
    public String adminAccidents() {
        return "forward:/admin/html/accident.html";
    }

    @GetMapping("/admin/depannage")
    public String adminDepannage() {
        return "forward:/admin/html/depanage.html";
    }

    @GetMapping("/admin/vidanges")
    public String adminVidanges() {
        return "forward:/admin/html/vidange.html";
    }

    @GetMapping("/admin/archivage")
    public String adminArchivage() {
        return "forward:/admin/html/archivage.html";
    }

    @GetMapping("/admin/profil")
    public String adminProfil() {
        return "forward:/admin/html/profile-admin.html";
    }

    @GetMapping("/admin/profil-entreprise")
    public String adminProfilEntreprise() {
        return "forward:/admin/html/profile-entreprise.html";
    }

    // ── Conducteur ────────────────────────────────────────────────────────────
    @GetMapping("/conducteur/dashboard")
    public String conducteurDashboard() {
        return "forward:/conducteur/html/dashboard.html";
    }

    @GetMapping("/conducteur/missions")
    public String conducteurMissions() {
        return "forward:/conducteur/html/mission.html";
    }

    @GetMapping("/conducteur/historique")
    public String conducteurHistorique() {
        return "forward:/conducteur/html/historique.html";
    }

    @GetMapping("/conducteur/incidents")
    public String conducteurIncidents() {
        return "forward:/conducteur/html/incident.html";
    }

    @GetMapping("/conducteur/documents")
    public String conducteurDocuments() {
        return "forward:/conducteur/html/documents.html";
    }

    @GetMapping("/conducteur/profil")
    public String conducteurProfil() {
        return "forward:/conducteur/html/profil.html";
    }

    @GetMapping("/conducteur/notifications")
    public String conducteurNotifications() {
        return "forward:/conducteur/html/notifications.html";
    }
}
