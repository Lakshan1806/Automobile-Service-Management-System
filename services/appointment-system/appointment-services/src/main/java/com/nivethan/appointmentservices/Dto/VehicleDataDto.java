package com.nivethan.appointmentservices.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class VehicleDataDto {
    private String vehicleId;
    private String noPlate;
    private String chaseNo;
    private String vehicleType;
    private String vehicleBrand;
    private String customerId;
    private String customerPhone;
    private String customerName;
    private Integer millage;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private LocalDateTime lastServiceDate;
}
