package com.ibrahim.parcvision.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Accès direct aux fichiers CSS/JS aplatis (vos règles actuelles)
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/home/css/", "classpath:/static/auth/css/", "classpath:/static/admin/css/", "classpath:/static/conducteur/css/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/home/js/", "classpath:/static/auth/js/", "classpath:/static/admin/js/", "classpath:/static/conducteur/js/");
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("classpath:/static/assets/");

        // Accès à TOUT le contenu de static (HTML et autres)
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
    }
}
