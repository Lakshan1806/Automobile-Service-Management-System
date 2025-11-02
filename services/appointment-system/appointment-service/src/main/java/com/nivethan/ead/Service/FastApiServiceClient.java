package com.nivethan.ead.Service;

import com.nivethan.ead.Dto.FastApiRequestDto;
import com.nivethan.ead.Dto.FastApiResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class FastApiServiceClient {
    private final WebClient webClient;

    public FastApiServiceClient(@Value("${fastapi.service.url}") String fastApiUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(fastApiUrl)
                .build();
    }

    public Mono<FastApiResponseDto> getSuggestedStartDate(FastApiRequestDto request) {
        return webClient.post()
                .uri("/suggest_start_date")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(FastApiResponseDto.class)
                .onErrorResume(error -> {
                    // Fallback logic or throw custom exception
                    return Mono.error(new RuntimeException("Prediction service unavailable"));
                });
    }
}
