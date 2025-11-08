package com.nivethan.appointmentservices.Service;

import com.nivethan.appointmentservices.Dto.VehicleDataDto;
import com.nivethan.appointmentservices.Dto.VehicleSummaryDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Slf4j
public class VehicleServiceClient {
    private final WebClient webClient;

    public VehicleServiceClient(@Value("${vehicle.service.url}") String vehicleServiceUrl) {
        log.info("Initializing VehicleServiceClient with URL: {}", vehicleServiceUrl);
        this.webClient = WebClient.builder()
                .baseUrl(vehicleServiceUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public Mono<VehicleDataDto> getVehicleData(String vehicleId) {
        log.info("Fetching vehicle data for ID: {}", vehicleId);

        return webClient.get()
                .uri("/vehicles/{vehicleId}/appointment-details", vehicleId) // <-- CORRECT
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                    log.error("Client error when fetching vehicle data: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Vehicle not found with ID: " + vehicleId));
                })
                .onStatus(HttpStatusCode::is5xxServerError, response -> {
                    log.error("Server error when fetching vehicle data: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Vehicle service is temporarily unavailable"));
                })
                .bodyToMono(VehicleDataDto.class)
                .doOnSuccess(data -> log.info("Successfully fetched vehicle data: {}", data))
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException) {
                        WebClientResponseException ex = (WebClientResponseException) error;
                        log.error("WebClient error - Status: {}, Message: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                    } else {
                        log.error("Error fetching vehicle data: {}", error.getMessage());
                    }
                })
                .onErrorResume(error -> {
                    log.error("Failed to fetch vehicle data for ID: {}. Error: {}", vehicleId, error.getMessage());
                    return Mono.error(new RuntimeException("Vehicle service unavailable: " + error.getMessage()));
                });
    }

    
    public Mono<List<VehicleSummaryDto>> getVehiclesForCustomer(String customerId) {
        log.info("Fetching vehicle list for customer ID: {}", customerId);

        return webClient.get()
                // .NET dev for this exact endpoint path ***
                .uri("/customers/{customerId}/vehicles", customerId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                    log.error("Client error fetching vehicle list: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Customer or vehicles not found: " + customerId));
                })
                .onStatus(HttpStatusCode::is5xxServerError, response -> {
                    log.error("Server error fetching vehicle list: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Vehicle service is temporarily unavailable"));
                })
                .bodyToFlux(VehicleSummaryDto.class) // Use bodyToFlux for a list
                .collectList() // Convert to a Mono<List>
                .doOnSuccess(list -> log.info("Fetched {} vehicles for customer {}", list.size(), customerId));
    }
}
