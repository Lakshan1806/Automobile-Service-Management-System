package com.nivethan.appointmentservices.Dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder // The Builder pattern is very convenient for this
public class AppointmentEvent {
    private String eventType; // e.g., "APPOINTMENT_CREATED", "APPOINTMENT_FAILED"
    private Long appointmentId;
    private String vehicleId;
    private String repairType;
    private String status;
    private String errorMessage;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
