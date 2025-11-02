package com.nivethan.ead.Dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class VehicleDataDto {
    private String vehicleId;
    private String noPlate;
    private String chaseNo;
    private String type;
    private String brand;
    private String customerId;
    private String customerPhone;
    private String customerName;
    private Integer millage;
    private LocalDate lastServiceDate;
}
