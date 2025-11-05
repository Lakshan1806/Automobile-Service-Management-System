package com.nivethan.appointmentservices.Controller;

import com.nivethan.appointmentservices.Dto.AppointmentRequestDto;
import com.nivethan.appointmentservices.Dto.AppointmentResponseDto;
import com.nivethan.appointmentservices.Dto.VehicleSummaryDto;
import com.nivethan.appointmentservices.Model.AppointmentStatus;
import com.nivethan.appointmentservices.Service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {
    private final AppointmentService appointmentService;

    @GetMapping("/my-vehicles")
    public Mono<ResponseEntity<List<VehicleSummaryDto>>> getMyVehicles(
            @AuthenticationPrincipal Jwt jwt) {

        // 'sub' is the standard user ID claim in a JWT
        String customerId = jwt.getSubject();

        return appointmentService.getVehiclesForCustomer(customerId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AppointmentResponseDto> createAppointment(
            @Valid @RequestBody AppointmentRequestDto requestDto,
            @AuthenticationPrincipal Jwt jwt) { 

        String customerId = jwt.getSubject(); 

        AppointmentResponseDto response = appointmentService.createAppointment(requestDto, customerId);
        return ResponseEntity.ok(response);
    }

    // ... (GET / endpoint is fine, but should be admin-only) ...
    @GetMapping
    public ResponseEntity<List<AppointmentResponseDto>> getAllAppointments() {
        List<AppointmentResponseDto> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        String customerId = jwt.getSubject();
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(id, customerId);
        return ResponseEntity.ok(appointment);
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointmentsByVehicleId(
            @PathVariable String vehicleId,
            @AuthenticationPrincipal Jwt jwt) {

        String customerId = jwt.getSubject();
        List<AppointmentResponseDto> appointments =
                appointmentService.getAppointmentsByVehicleId(vehicleId, customerId);
        return ResponseEntity.ok(appointments);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AppointmentResponseDto> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam AppointmentStatus status,
            @AuthenticationPrincipal Jwt jwt) {

        String customerId = jwt.getSubject();
        AppointmentResponseDto updatedAppointment =
                appointmentService.updateAppointmentStatus(id, status, customerId);
        return ResponseEntity.ok(updatedAppointment);
    }
}
