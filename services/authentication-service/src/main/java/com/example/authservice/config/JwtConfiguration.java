package com.example.authservice.config;

import com.example.authservice.security.RsaKeyManager;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jose.jwk.source.JWKSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
public class JwtConfiguration {

    @Bean
    public JWKSource<SecurityContext> jwkSource(RsaKeyManager rsaKeyManager) {
        return (jwkSelector, securityContext) -> jwkSelector.select(rsaKeyManager.signingKeys());
    }

    @Bean
    public JwtEncoder jwtEncoder(JWKSource<SecurityContext> jwkSource) {
        return new NimbusJwtEncoder(jwkSource);
    }
}
