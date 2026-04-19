package com.ibrahim.parcvision;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/home/html/index.html");
        registry.addViewController("/home").setViewName("forward:/home/html/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Specifically map your CSS, JS, images
        registry.addResourceHandler("/css/**")
                .addResourceLocations(
                        "classpath:/static/home/css/",
                        "classpath:/static/auth/css/"
                );
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/home/js/");
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/assets/");
    }

}
