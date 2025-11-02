package com.nivethan.ead.Service;

import com.nivethan.ead.Dto.VehicleDataDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class VehicleServiceClient {
    private final WebClient webClient;

    public VehicleServiceClient(@Value("${vehicle.service.url}") String vehicleServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(vehicleServiceUrl)
                .build();
    }

    public Mono<VehicleDataDto> getVehicleData(String vehicleId) {
        return webClient.get()
                .uri("/api/vehicles/{vehicleId}", vehicleId)
                .retrieve()
                .bodyToMono(VehicleDataDto.class)
                .onErrorResume(error -> {
                    // Log error and return empty or throw custom exception
                    return Mono.error(new RuntimeException("Vehicle service unavailable"));
                });
    }
}
