package com.ibrahim.parcvision.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtService {
    @Value("${jwt.secret}")
    private String secret;
    @Value("${jwt.expiration}")
    private Long expiration;
    private Key signingKey ;

    private SecretKey getSigningKey(){
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    private boolean isTokenExprired(String token) {
        return this.extractClaims(token).getExpiration().before(new Date());
    }
    public void setExpiration(Long time){
        expiration = time;
    }
    public Claims extractClaims(String token){
        Claims c = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return c ;
    }

    private String createToken(
            String subject
    ){
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }
    public String generateToken(
        UserDetails user
    ){
        return createToken(user.getUsername());
    }

    public String extractEmail(String token) {
        Claims claims = Jwts.parser()                 // we are extracting the subject ( username )
                .verifyWith(getSigningKey())                      // make sure the token was not changed ( verify the signature)
                .build()                              // Builds the immutable parser
                .parseSignedClaims(token)             // Replaces parseClaimsJws
                .getPayload();                        // Replaces getBody
        return claims.getSubject();
    }
    public boolean validateToken(
        String email,
        UserDetails userDetails,
        String token
    ){
        return email.equals(userDetails.getUsername()) && !isTokenExprired(token);
    }
}
