package com.nivethan.ead.Controller;

import com.nivethan.ead.Dto.AppointmentRequestDTO;
import com.nivethan.ead.Dto.AppointmentResponseDTO;
import com.nivethan.ead.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping("/create")
    public AppointmentResponseDTO createAppointment(@RequestBody AppointmentRequestDTO requestDTO){
        return appointmentService.createAppointment(requestDTO);
    }

}
