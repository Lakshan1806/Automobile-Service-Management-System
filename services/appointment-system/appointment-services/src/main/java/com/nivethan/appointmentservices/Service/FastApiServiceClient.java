package com.nivethan.appointmentservices.Service;

import com.nivethan.appointmentservices.Dto.FastApiRequestDto;
import com.nivethan.appointmentservices.Dto.FastApiResponseDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class FastApiServiceClient {
    private final WebClient webClient;

    public FastApiServiceClient(@Value("${fastapi.service.url}") String fastApiUrl) {
        log.info("Initializing FastApiServiceClient with URL: {}", fastApiUrl);
        this.webClient = WebClient.builder()
                .baseUrl(fastApiUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public Mono<FastApiResponseDto> getSuggestedStartDate(FastApiRequestDto request) {
        log.info("Calling FastAPI with request: {}", request);

        return webClient.post()
                .uri("/api/suggest_start_date")
                .bodyValue(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, response -> {
                    log.error("Client error from FastAPI: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Invalid request to prediction service"));
                })
                .onStatus(HttpStatusCode::is5xxServerError, response -> {
                    log.error("Server error from FastAPI: {}", response.statusCode());
                    return Mono.error(new RuntimeException("Prediction service is temporarily unavailable"));
                })
                .bodyToMono(FastApiResponseDto.class)
                .doOnSuccess(response -> log.info("Successfully received prediction: {}", response))
                .doOnError(error -> {
                    if (error instanceof WebClientResponseException) {
                        WebClientResponseException ex = (WebClientResponseException) error;
                        log.error("FastAPI WebClient error - Status: {}, Message: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                    } else {
                        log.error("Error calling FastAPI: {}", error.getMessage());
                    }
                })
                .onErrorResume(error -> {
                    log.warn("FastAPI service unavailable, using fallback logic. Error: {}", error.getMessage());
                    // Return a fallback response instead of throwing error
                    return createFallbackResponse(request);
                });
    }

    private Mono<FastApiResponseDto> createFallbackResponse(FastApiRequestDto request) {
        // Create a fallback response when FastAPI is unavailable
        FastApiResponseDto fallback = new FastApiResponseDto();
        // You can set some default values here
        fallback.setPredictedDuration(5); // default 5 days
        fallback.setAccuracy(0.0); // 0% accuracy for fallback
        // You might want to calculate a simple suggested start date based on manual start date
        // For now, we'll return null for suggestedStartDate and handle it in the service

        log.info("Using fallback response for FastAPI");
        return Mono.just(fallback);
    }
}
