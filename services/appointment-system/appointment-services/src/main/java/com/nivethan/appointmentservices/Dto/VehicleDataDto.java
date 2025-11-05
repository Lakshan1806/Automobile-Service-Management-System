package com.nivethan.appointmentservices.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

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
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate lastServiceDate;
    private Integer vehicleModelYear;
    private Integer vehicleRegistrationYear;
}
