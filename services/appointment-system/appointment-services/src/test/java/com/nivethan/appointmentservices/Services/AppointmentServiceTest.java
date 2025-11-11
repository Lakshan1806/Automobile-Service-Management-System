// File: src/test/java/com/nivethan/appointmentservices/Service/AppointmentServiceTest.java

package com.nivethan.appointmentservices.Services; // Note: Your log showed 'Services' (plural). Use your actual package name.

import com.nivethan.appointmentservices.Dto.*;
import com.nivethan.appointmentservices.Model.AppointmentStatus;
import com.nivethan.appointmentservices.Model.RepairAppointmentRequest;
import com.nivethan.appointmentservices.Repository.RepairAppointmentRepository;
import com.nivethan.appointmentservices.Service.AppointmentService;
import com.nivethan.appointmentservices.Service.FastApiServiceClient;
import com.nivethan.appointmentservices.Service.VehicleServiceClient;
import com.nivethan.audit.AuditProducerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @InjectMocks
    private AppointmentService appointmentService;

    @Mock
    private RepairAppointmentRepository appointmentRepository;
    @Mock
    private VehicleServiceClient vehicleServiceClient;
    @Mock
    private FastApiServiceClient fastApiServiceClient;
    @Mock
    private AuditProducerService auditProducer;

    // --- Reusable test data ---
    private AppointmentRequestDto requestDto;
    private VehicleDataDto vehicleData;
    private FastApiResponseDto predictionData;
    private RepairAppointmentRequest savedAppointment;
    private String customerId = "1";

    @BeforeEach
    void setUp() {
        requestDto = new AppointmentRequestDto();
        requestDto.setVehicleId("vehicle-123");
        requestDto.setRepairType("General Service");

        vehicleData = new VehicleDataDto();
        vehicleData.setVehicleId("vehicle-123");
        vehicleData.setCustomerId(customerId);
        vehicleData.setLastServiceDate(LocalDate.now().minusMonths(6));

        // --- THIS IS THE FIX for the NullPointerException ---
        vehicleData.setMillage(50000);
        // Also set other fields that are used
        vehicleData.setVehicleType("Car");
        vehicleData.setVehicleBrand("Toyota");
        vehicleData.setVehicleModelYear(2020);


        predictionData = new FastApiResponseDto();
        predictionData.setSuggestedStartDate(LocalDate.now().plusDays(10));
        predictionData.setPredictedDuration(3);
        predictionData.setConfidence(0.85);

        savedAppointment = new RepairAppointmentRequest();
        savedAppointment.setId(1L);
        savedAppointment.setVehicleId("vehicle-123");
        savedAppointment.setCustomerId(customerId);
        savedAppointment.setStatus(AppointmentStatus.PENDING);
        savedAppointment.setRepairType("General Service"); // Add this for the audit log
    }

    @Test
    void testCreateAppointment_Success() {
        // --- 1. Arrange (Given) ---
        when(vehicleServiceClient.getVehicleData("vehicle-123")).thenReturn(Mono.just(vehicleData));
        when(fastApiServiceClient.getSuggestedStartDate(any(FastApiRequestDto.class))).thenReturn(Mono.just(predictionData));
        when(appointmentRepository.save(any(RepairAppointmentRequest.class))).thenReturn(savedAppointment);

        // --- 2. Act (When) ---
        AppointmentResponseDto response = appointmentService.createAppointment(requestDto, customerId);

        // --- 3. Assert (Then) ---
        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("PENDING", response.getStatus());

        verify(vehicleServiceClient, times(1)).getVehicleData("vehicle-123");
        verify(fastApiServiceClient, times(1)).getSuggestedStartDate(any(FastApiRequestDto.class));
        verify(appointmentRepository, times(1)).save(any(RepairAppointmentRequest.class));
        // Verify the success event is called
        verify(auditProducer, times(1)).sendSuccessEvent(eq("APPOINTMENT_CREATED"), any(String.class), any(Map.class));
    }

    @Test
    void testCreateAppointment_AccessDenied() {
        // --- 1. Arrange (Given) ---
        String attackerCustomerId = "99";
        when(vehicleServiceClient.getVehicleData("vehicle-123")).thenReturn(Mono.just(vehicleData));

        // --- 2. Act & 3. Assert (When & Then) ---
        assertThrows(AccessDeniedException.class, () -> {
            appointmentService.createAppointment(requestDto, attackerCustomerId);
        });

        verify(appointmentRepository, never()).save(any(RepairAppointmentRequest.class));
        verify(fastApiServiceClient, never()).getSuggestedStartDate(any(FastApiRequestDto.class));
        // Verify the failure event is called
        verify(auditProducer, times(1)).sendFailureEvent(eq("APPOINTMENT_FAILED"), any(String.class), any(Map.class), any(String.class));
    }
}