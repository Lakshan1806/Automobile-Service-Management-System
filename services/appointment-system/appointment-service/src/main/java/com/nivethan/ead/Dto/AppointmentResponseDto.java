package com.nivethan.ead.Dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AppointmentResponseDto {
    private Long id;
    private String vehicleId;
    private String noPlate;
    private String customerName;
    private String customerPhone;
    private String repairType;
    private String description;
    private LocalDate manualStartDate;
    private LocalDate suggestedStartDate;
    private Integer predictedDuration;
    private Double accuracy;
    private String status;
    private LocalDateTime createdAt;
}
