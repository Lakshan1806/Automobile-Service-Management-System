package com.example.authservice.security;

import com.example.authservice.config.TokenProperties;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class RsaKeyManager {

    private static final Logger log = LoggerFactory.getLogger(RsaKeyManager.class);

    private final TokenProperties tokenProperties;
    private final ConcurrentLinkedDeque<RSAKey> keyChain = new ConcurrentLinkedDeque<>();

    public RsaKeyManager(TokenProperties tokenProperties) {
        this.tokenProperties = tokenProperties;
        generateKeyIfEmpty();
    }

    public RSAKey currentSigningKey() {
        RSAKey key = keyChain.peekFirst();
        if (key == null) {
            throw new IllegalStateException("No signing key available");
        }
        return key;
    }

    public String currentKeyId() {
        return currentSigningKey().getKeyID();
    }

    public JWKSet signingKeys() {
        return new JWKSet(keyChain.stream()
                .map(jwk -> (com.nimbusds.jose.jwk.JWK) jwk)
                .collect(Collectors.toList()));
    }

    public JWKSet publishedPublicKeys() {
        return new JWKSet(keyChain.stream()
                .map(RSAKey::toPublicJWK)
                .map(jwk -> (com.nimbusds.jose.jwk.JWK) jwk)
                .collect(Collectors.toList()));
    }

    public synchronized void rotateKeys() {
        RSAKey newKey = generateRsaKey();
        keyChain.addFirst(newKey);
        // Keep only the maximum number of published keys (new + old for rollover)
        while (keyChain.size() > Math.max(1, tokenProperties.getMaxPublishedKeys())) {
            keyChain.pollLast();
        }
        log.info("Rotated signing keys. Active key id={} generatedAt={}", newKey.getKeyID(), Instant.now());
    }

    private void generateKeyIfEmpty() {
        if (keyChain.isEmpty()) {
            RSAKey key = generateRsaKey();
            keyChain.add(key);
            log.info("Generated initial RSA key pair. kid={}", key.getKeyID());
        }
    }

    private RSAKey generateRsaKey() {
        try {
            return new RSAKeyGenerator(tokenProperties.getKeySize())
                    .algorithm(JWSAlgorithm.RS256)
                    .keyUse(com.nimbusds.jose.jwk.KeyUse.SIGNATURE)
                    .keyID(UUID.randomUUID().toString())
                    .generate();
        } catch (JOSEException ex) {
            throw new IllegalStateException("Failed to generate RSA key pair", ex);
        }
    }
}
