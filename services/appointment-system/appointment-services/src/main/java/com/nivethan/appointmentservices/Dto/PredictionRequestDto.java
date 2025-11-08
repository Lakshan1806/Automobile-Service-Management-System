// File: com/nivethan/appointmentservices/Dto/PredictionRequestDto.java
package com.nivethan.appointmentservices.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PredictionRequestDto {

    @NotBlank(message = "Vehicle ID is required")
    private String vehicleId;

    @NotBlank(message = "Repair type is required")
    private String repairType;

    // Mileage might be updated by the user, so we take it as input
    @NotNull(message = "Millage is required")
    private Integer millage;
}