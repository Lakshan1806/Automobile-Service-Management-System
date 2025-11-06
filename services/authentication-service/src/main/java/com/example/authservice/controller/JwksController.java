package com.example.authservice.controller;

import com.example.authservice.security.RsaKeyManager;
import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class JwksController {

    private final RsaKeyManager rsaKeyManager;

    public JwksController(RsaKeyManager rsaKeyManager) {
        this.rsaKeyManager = rsaKeyManager;
    }

    @GetMapping(value = "/.well-known/jwks.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> jwks() {
        return rsaKeyManager.publishedPublicKeys().toJSONObject();
    }
}
