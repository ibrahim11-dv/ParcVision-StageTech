package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.AuthRequestDao;
import com.ibrahim.parcvision.service.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthenticationManager authenticationManager;
    private JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public String login(
            @RequestBody AuthRequestDao authReqest,
            HttpServletResponse response
    ){
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authReqest.getEmail(),
                        authReqest.getPassword()
                )
        );
        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        String token = jwtService.generateToken(userDetails);
        Cookie cookie = new Cookie("jwt_token",token);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        if(authReqest.isRememberMe()){
            // set to 30 day
            cookie.setMaxAge(60*60*24*30);
            jwtService.setExpiration(2592000000L);
        }else{
            //already 8h par default so no need for setting it
            cookie.setMaxAge(60*60*8);
        }
        response.addCookie(cookie);
        return token;
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletResponse response
    ){
        Cookie cookie = new Cookie("jwt_token",null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("loggedOut");
    }


}
