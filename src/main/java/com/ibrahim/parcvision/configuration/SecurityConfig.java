package com.ibrahim.parcvision.configuration;

import jakarta.servlet.FilterChain;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http){
        // to disable crsf
        // .crsf(crsf-> crsf.disable())
        http
                .csrf(AbstractHttpConfigurer::disable)
                // 2. Make sure there's NO session (Stateless API)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/","/login","/register").permitAll()
                                .anyRequest().authenticated())
                                .httpBasic(Customizer.withDefaults());
        // for adding awt filter
        // http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        // default filter ( basic auth )
        //.httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
