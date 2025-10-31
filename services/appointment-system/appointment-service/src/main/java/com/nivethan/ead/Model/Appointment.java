package com.nivethan.ead.Model;
import jakarta.persistence.Entity;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "appointment")
public class Appointment {
    @Id
    // Generating an RFC 4122 Universally Unique Identifier.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id", nullable = false, updatable = false)
    private Long appointmentId;

    //From Customer Table
    @Column(name = "customer_id")
    private Long customerId;
    @Column(name = "customer_name")
    private String customerName;

    //From Vehicle Table
    @Column(name = "vehicle_id")
    private Long vehicleId;
    @Column(name = "vehicle_no")
    private String vehicleNo;
    @Column(name = "vehicle_type")
    private String vehicleType;

    //Appointment reserved Date and Time
    @Column(name = "appointment_date")
    private LocalDateTime appointmentDate;
    @Column(name = "appointment_time")
    private LocalDateTime appointmentTime;

    @Column(name = "description")
    private String description;
    @Column(name = "status")
    private String status;

    //Model Driven Date and Time
    @Column(name = "suggested_date")
    private LocalDateTime suggestedDate;
    @Column(name = "sugessted_time")
    private LocalDateTime suggestedTime;
}
