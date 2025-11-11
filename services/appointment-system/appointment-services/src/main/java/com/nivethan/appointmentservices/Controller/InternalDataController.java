package com.nivethan.appointmentservices.Controller;

import com.nivethan.appointmentservices.Dto.AppointmentResponseDto;
import com.nivethan.appointmentservices.Service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/manager/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalDataController {

    private final AppointmentService appointmentService;

    /**
     * [INSECURE - FOR TESTING ONLY]
     * A public endpoint for other services to fetch all appointment data.
     * This has NO security.
     */
    @GetMapping("/appointments/all")
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointmentsInternal() {

        log.info("INTERNAL-API (INSECURE): Fetching all appointments.");
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }
}
