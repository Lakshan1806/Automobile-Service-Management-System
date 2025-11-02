package com.nivethan.ead.Controller;

import com.nivethan.ead.Dto.AppointmentRequestDto;
import com.nivethan.ead.Dto.AppointmentResponseDto;
import com.nivethan.ead.Model.AppointmentStatus;
import com.nivethan.ead.Service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(
            @Valid @RequestBody AppointmentRequestDto requestDto) {
        AppointmentResponseDto response = appointmentService.createAppointment(requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointmentsByVehicleId(
            @PathVariable String vehicleId) {
        List<AppointmentResponseDto> appointments =
                appointmentService.getAppointmentsByVehicleId(vehicleId);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status) {
        AppointmentResponseDto updatedAppointment =
                appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(updatedAppointment);
    }
}
