package com.ibrahim.parcvision.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FournisseurViewController {

    @GetMapping("/admin/fournisseurs")
    public String adminFournisseurs() {
        return "forward:/admin/html/fournisseur.html";
    }
}
