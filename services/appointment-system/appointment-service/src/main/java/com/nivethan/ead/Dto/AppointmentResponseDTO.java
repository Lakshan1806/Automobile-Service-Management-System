package com.nivethan.ead.Dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponseDTO {
    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private Long vehicleId;
    private String vehicleNo;
    private String vehicleType;
    private LocalDateTime appointmentDate;
    private LocalDateTime appointmentTime;
    private String description;
    private String status;
    private LocalDateTime suggestedDate;
    private LocalDateTime suggestedTime;
}
