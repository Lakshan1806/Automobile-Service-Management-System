package com.nivethan.appointmentservices.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "repair_appointment_request")
@Data
public class RepairAppointmentRequest {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vehicle_id", nullable = false)
    private String vehicleId;

    @Column(name = "no_plate")
    private String noPlate;

    @Column(name = "chase_no")
    private String chaseNo;

    @Column(name = "vehicle_type")
    private String vehicleType;

    @Column(name = "vehicle_brand")
    private String vehicleBrand;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "millage")
    private Integer millage;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "manual_start_date")
    private LocalDate manualStartDate;

    @Column(name = "repair_type")
    private String repairType;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "suggested_start_date")
    private LocalDate suggestedStartDate;

    @Column(name = "predicted_duration")
    private Integer predictedDuration; // in days

    @Column(name = "accuracy")
    private Double accuracy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AppointmentStatus status = AppointmentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
