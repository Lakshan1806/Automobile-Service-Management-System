package com.nivethan.appointmentservices.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class FastApiRequestDto {
    private String vehicleType;
    private String vehicleBrand;
    private String repairType;
    private String millage;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private String lastService;
}
