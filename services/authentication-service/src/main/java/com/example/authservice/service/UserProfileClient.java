package com.example.authservice.service;

import com.example.authservice.config.UserServiceProperties;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
public class UserProfileClient {

    private static final Logger log = LoggerFactory.getLogger(UserProfileClient.class);

    private final RestClient restClient;
    private final UserServiceProperties properties;

    public UserProfileClient(RestClient.Builder restClientBuilder, UserServiceProperties properties) {
        this.properties = properties;
        if (properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            this.restClient = null;
        } else {
            this.restClient = restClientBuilder
                    .baseUrl(properties.getBaseUrl())
                    .build();
        }
    }

    public void createCustomerProfile(Long customerId) {
        if (customerId == null) {
            return;
        }
        if (restClient == null) {
            log.warn("User-service base URL is not configured. Skipping profile creation for customer {}", customerId);
            return;
        }

        try {
            restClient.post()
                    .uri("/api/customer-profiles")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("customerId", customerId))
                    .retrieve()
                    .toBodilessEntity();
            log.debug("Created user profile placeholder for customer {}", customerId);
        } catch (RestClientException ex) {
            log.error("Failed to create user profile placeholder for customer {}", customerId, ex);
        }
    }
}
