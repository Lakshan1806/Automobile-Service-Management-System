package com.nivethan.ead.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class FastApiRequestDto {
    private String vehicleType;
    private String repairType;
    private String millage;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private String lastService;
}
