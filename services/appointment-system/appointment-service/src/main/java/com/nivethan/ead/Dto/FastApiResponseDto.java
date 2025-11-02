package com.nivethan.ead.Dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class FastApiResponseDto {
    private LocalDate suggestedStartDate;
    private Integer predictedDuration;
    private Double accuracy;
}
