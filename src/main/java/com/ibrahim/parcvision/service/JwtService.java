package com.ibrahim.parcvision.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtService {
    @Value("${jwt.secret:SUPER-DUPER-SECRET-KEY-NIHAHAHAHh9ufehufwe0h0hwiuohsfeh08ah0s808fh80ewhfh0weh0fodsaH28H2V8FE80H8E2F038Q2H08FWEH08FEH08FEHF8E0H08FEH8HH8FEH8EHFHH80H80FWofuidsubof}")
    private String secret;
    @Value("${jwt.expiration:28800000}")
    private Long expiration;
    private Key signingKey;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    private boolean isTokenExprired(String token) {
        return this.extractClaims(token).getExpiration().before(new Date());
    }

    public Long getExpiration() {
        return expiration;
    }

    public void setExpiration(Long time) {
        expiration = time;
    }

    public Claims extractClaims(String token) {
        Claims c = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return c;
    }

    private String createToken(String subject, long customExpiration) {
        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + customExpiration))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateToken(UserDetails user) {
        return createToken(user.getUsername(), expiration != null ? expiration : 86400000L);
    }

    public String generateToken(UserDetails user, long customExpiration) {
        return createToken(user.getUsername(), customExpiration);
    }

    public String extractEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claims.getSubject();
    }

    public boolean validateToken(
            String email,
            UserDetails userDetails,
            String token
    ) {
        return email.equals(userDetails.getUsername()) && !isTokenExprired(token);
    }

    public String extractEmailFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        try {
            if (cookies != null) {
                for (Cookie c : cookies) {
                    if (c.getName().equals("jwt_token")) {
                        return extractEmail(c.getValue());
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }
}
