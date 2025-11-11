package com.nivethan.appointmentservices.Dto;


import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalDate;


@Data
public class AppointmentResponseDto {
    private Long id;
    private String vehicleId;
    private String customerId;
    private String vehicleBrand;
    private String vehicleType;
    private String chaseNo;
    private Integer millage;
    private Integer vehicleModelYear;
    private Integer vehicleRegistrationYear;
    private String noPlate;
    private String customerName;
    private String customerPhone;
    private LocalDate lastServiceDate;
    private String repairType;
    private String description;
    private LocalDate manualStartDate;
    private LocalDate suggestedStartDate;
    private Integer predictedDuration;
    private Double confidence;
    private String status;
    private LocalDateTime createdAt;
}
