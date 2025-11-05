package com.example.authservice.security;

import com.example.authservice.model.Customer;
import com.example.authservice.model.EmployeeAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenService {

    private final SecretKey secretKey;
    private final long expirationSeconds;

    public JwtTokenService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-seconds:3600}") long expirationSeconds) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }
        SecretKey key;
        try {
            key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        } catch (WeakKeyException ex) {
            throw new IllegalStateException("JWT secret must be at least 32 characters", ex);
        }
        this.secretKey = key;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(Customer customer) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(customer.getId()))
                .claim("email", customer.getEmail())
                .claim("name", customer.getName())
                .claim("type", "customer")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(secretKey)
                .compact();
    }

    public String generateToken(EmployeeAccount account) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(account.getId()))
                .claim("email", account.getEmail())
                .claim("employeeId", account.getEmployeeId())
                .claim("role", account.getRole())
                .claim("type", "employee")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(secretKey)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}
