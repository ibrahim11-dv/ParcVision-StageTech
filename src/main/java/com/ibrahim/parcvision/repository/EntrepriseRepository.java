package com.ibrahim.parcvision.repository;

import com.ibrahim.parcvision.entity.Entreprise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EntrepriseRepository extends JpaRepository<Entreprise, Long> {
    Optional<Entreprise> findByNom(String nom);
    Optional<Entreprise> findByEmail(String email);
    Optional<Entreprise> findByAdresse(String adresse);
    Optional<Entreprise> findByTelephone(String telephone);

    // Check existence methods
    boolean existsByNom(String nom);
    boolean existsByEmail(String email);
    boolean existsByAdresse(String adresse);
    boolean existsByTelephone(String telephone);
}
