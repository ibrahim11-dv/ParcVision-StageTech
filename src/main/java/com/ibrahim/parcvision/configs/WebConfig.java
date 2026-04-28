package com.ibrahim.parcvision.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Home
        registry.addViewController("/").setViewName("forward:/static/home/html/index.html");

        // Auth
        registry.addViewController("/login").setViewName("forward:/static/auth/html/login.html");
        registry.addViewController("/register").setViewName("forward:/static/auth/html/register.html");

        // Admin pages
        registry.addViewController("/admin/dashboard").setViewName("forward:/static/admin/html/dashboard.html");
        registry.addViewController("/admin/conducteurs").setViewName("forward:/static/admin/html/conducteur.html");
        registry.addViewController("/admin/vehicules").setViewName("forward:/static/admin/html/vehicule.html");
        registry.addViewController("/admin/gps").setViewName("forward:/static/admin/html/suivi-gps.html");
        registry.addViewController("/admin/reparations").setViewName("forward:/static/admin/html/reparation.html");
        registry.addViewController("/admin/accidents").setViewName("forward:/static/admin/html/accident.html");
        registry.addViewController("/admin/depannage").setViewName("forward:/static/admin/html/depanage.html");
        registry.addViewController("/admin/vidanges").setViewName("forward:/static/admin/html/vidange.html");
        registry.addViewController("/admin/archivage").setViewName("forward:/static/admin/html/archivage.html");
        registry.addViewController("/admin/profil").setViewName("forward:/static/admin/html/profile-admin.html");
        registry.addViewController("/admin/profil-entreprise").setViewName("forward:/static/admin/html/profile-entreprise.html");

        // Conducteur pages
        registry.addViewController("/conducteur/dashboard").setViewName("forward:/static/conducteur/html/dashboard.html");
        registry.addViewController("/conducteur/missions").setViewName("forward:/static/conducteur/html/mission.html");
        registry.addViewController("/conducteur/historique").setViewName("forward:/static/conducteur/html/historique.html");
        registry.addViewController("/conducteur/incidents").setViewName("forward:/static/conducteur/html/incident.html");
        registry.addViewController("/conducteur/documents").setViewName("forward:/static/conducteur/html/documents.html");
        registry.addViewController("/conducteur/profil").setViewName("forward:/static/conducteur/html/profil.html");
        registry.addViewController("/conducteur/notifications").setViewName("forward:/static/conducteur/html/notifications.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Specifically map your CSS, JS, images
        registry.addResourceHandler("/css/**")
                .addResourceLocations(
                        "classpath:/static/home/css/",
                        "classpath:/static/auth/css/",
                        "classpath:/static/admin/css/",
                        "classpath:/static/conducteur/css/"

                );
        registry.addResourceHandler("/js/**")
                .addResourceLocations(
                        "classpath:/static/home/js/",
                        "classpath:/static/auth/js/",
                        "classpath:/static/admin/js/",
                        "classpath:/static/conducteur/js/"
                );
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");
    }

}
