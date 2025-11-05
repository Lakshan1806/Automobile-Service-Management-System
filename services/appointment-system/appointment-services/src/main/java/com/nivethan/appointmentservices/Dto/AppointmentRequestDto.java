package com.nivethan.appointmentservices.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AppointmentRequestDto {
    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    private LocalDate manualStartDate;

    @NotBlank(message = "Repair type is required")
    private String repairType;

    private String description;
}
