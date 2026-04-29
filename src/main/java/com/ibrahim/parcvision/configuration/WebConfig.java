package com.ibrahim.parcvision.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Flatten CSS, JS and assets into single URL namespaces so that
        // relative "../css/..." links in HTML resolve correctly at clean URLs.
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
