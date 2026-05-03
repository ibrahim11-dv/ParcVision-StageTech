package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.dao.ProfileMinimalInfoDao;
import com.ibrahim.parcvision.entity.Utilisateur;
import com.ibrahim.parcvision.repository.AdminRepository;
import com.ibrahim.parcvision.repository.EntrepriseRepository;
import com.ibrahim.parcvision.repository.UtilisateurRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProfileService {
    UtilisateurRepository utilisateurRepository;
    AdminRepository adminRepository;
    EntrepriseRepository entrepriseRepository;
    JwtService jwtService;

    public ProfileService(JwtService jwtService,UtilisateurRepository utilisateurRepository, AdminRepository adminRepository, EntrepriseRepository entrepriseRepository) {
        this.utilisateurRepository = utilisateurRepository;
        this.adminRepository = adminRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.jwtService = jwtService;
    }

    public ResponseEntity<ProfileMinimalInfoDao> getMinimalUserInfo(
            HttpServletRequest request
    ){
        String email = jwtService.extractEmailFromCookie(request);
        Utilisateur user = utilisateurRepository.findByEmail(email)
                .orElseThrow();
        ProfileMinimalInfoDao reponseInfo = new ProfileMinimalInfoDao();
        reponseInfo.setEmail(user.getEmail());
        reponseInfo.setNom(user.getNom());
        reponseInfo.setPrenom(user.getPrenom());
        return new ResponseEntity<>(reponseInfo,HttpStatus.OK);
    }


}
