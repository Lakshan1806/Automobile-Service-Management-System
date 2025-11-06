package com.example.authservice.security;

import com.example.authservice.config.TokenProperties;
import com.example.authservice.model.Customer;
import com.example.authservice.model.EmployeeAccount;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.RSAKey;

@Component
public class JwtTokenService {

    private final JwtEncoder jwtEncoder;
    private final TokenProperties tokenProperties;
    private final RsaKeyManager rsaKeyManager;

    public JwtTokenService(JwtEncoder jwtEncoder, TokenProperties tokenProperties, RsaKeyManager rsaKeyManager) {
        this.jwtEncoder = jwtEncoder;
        this.tokenProperties = tokenProperties;
        this.rsaKeyManager = rsaKeyManager;
    }

    public String generateCustomerToken(Customer customer) {
        return encodeToken(
                String.valueOf(customer.getId()),
                "customers",
                List.of("CUSTOMER"),
                builder -> builder
                        .claim("email", customer.getEmail())
                        .claim("name", customer.getName()));
    }

    public String generateEmployeeToken(EmployeeAccount account) {
        String role = account.getRole();
        if (role == null || role.isBlank()) {
            throw new IllegalStateException("Employee account is missing role information");
        }
        return encodeToken(
                String.valueOf(account.getId()),
                "employees",
                List.of(role.toUpperCase()),
                builder -> builder
                        .claim("email", account.getEmail())
                        .claim("employeeId", account.getEmployeeId()));
    }

    public long getExpirationSeconds() {
        return tokenProperties.getTtl().toSeconds();
    }

    public Jwt decodeToken(String token) {
        JwtException lastException = null;
        for (JWK jwk : rsaKeyManager.signingKeys().getKeys()) {
            if (jwk instanceof RSAKey rsaKey && rsaKey.isPrivate()) {
                try {
                    JwtDecoder decoder = NimbusJwtDecoder.withPublicKey(rsaKey.toRSAPublicKey()).build();
                    return decoder.decode(token);
                } catch (JwtException | JOSEException ex) {
                    lastException = ex instanceof JwtException ? (JwtException) ex : new JwtException(ex.getMessage(), ex);
                }
            }
        }
        throw new IllegalArgumentException("Unable to decode JWT", lastException);
    }

    private String encodeToken(
            String subject,
            String realm,
            List<String> roles,
            java.util.function.Consumer<JwtClaimsSet.Builder> customizer) {
        Instant now = Instant.now();
        JwtClaimsSet.Builder claimsBuilder = JwtClaimsSet.builder()
                .issuer(tokenProperties.getIssuer())
                .audience(List.of(tokenProperties.getAudience()))
                .subject(subject)
                .issuedAt(now)
                .expiresAt(now.plus(tokenProperties.getTtl()))
                .claim("realm", realm)
                .claim("roles", roles);
        customizer.accept(claimsBuilder);

        JwtClaimsSet claims = claimsBuilder.build();
        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256)
                .keyId(rsaKeyManager.currentKeyId())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
