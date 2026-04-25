package com.ibrahim.parcvision.configs;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/home/html/index.html");
        registry.addViewController("/admin/dashboard").setViewName("forward:/admin/html/dashboard.html");
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
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/assets/");
    }

}
