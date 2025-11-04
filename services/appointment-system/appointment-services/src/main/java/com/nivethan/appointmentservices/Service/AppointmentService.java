package com.nivethan.appointmentservices.Service;

import com.nivethan.appointmentservices.Dto.*;
import com.nivethan.appointmentservices.Model.AppointmentStatus;
import com.nivethan.appointmentservices.Model.RepairAppointmentRequest;
import com.nivethan.appointmentservices.Repository.RepairAppointmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {


    private final RepairAppointmentRepository appointmentRepository;
    private final VehicleServiceClient vehicleServiceClient;
    private final FastApiServiceClient fastApiServiceClient;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto) {
        try {
            log.info("Creating appointment for vehicle ID: {}", requestDto.getVehicleId());

            // Step 1: Get vehicle data from vehicle microservice
            VehicleDataDto vehicleData = vehicleServiceClient.getVehicleData(requestDto.getVehicleId())
                    .block();

            if (vehicleData == null) {
                throw new RuntimeException("Vehicle not found with ID: " + requestDto.getVehicleId());
            }

            log.info("Successfully retrieved vehicle data: {}", vehicleData.getVehicleId());

            // Step 2: Prepare data for FastAPI prediction
            FastApiRequestDto fastApiRequest = new FastApiRequestDto();
            fastApiRequest.setVehicleType(vehicleData.getVehicleType());
            fastApiRequest.setVehicleBrand(vehicleData.getVehicleBrand());
            fastApiRequest.setRepairType(requestDto.getRepairType());
            fastApiRequest.setMillage(vehicleData.getMillage().toString());

            // Convert LocalDateTime to LocalDate for the format needed by FastAPI
            LocalDate lastServiceLocalDate = vehicleData.getLastServiceDate();
            fastApiRequest.setLastService(lastServiceLocalDate.format(DATE_FORMATTER));

            fastApiRequest.setVehicleModelYear(vehicleData.getVehicleModelYear());

            log.info("Calling FastAPI with prediction request: {}", fastApiRequest);

            // Step 3: Get prediction from FastAPI
            FastApiResponseDto fastApiResponse = fastApiServiceClient.getSuggestedStartDate(fastApiRequest)
                    .block();

            // Step 4: Create and save appointment
            RepairAppointmentRequest appointment = createAppointmentEntity(requestDto, vehicleData, fastApiResponse, lastServiceLocalDate);

            // Save to database
            RepairAppointmentRequest savedAppointment = appointmentRepository.save(appointment);
            log.info("Successfully created appointment with ID: {}", savedAppointment.getId());

            return convertToResponseDto(savedAppointment);

        } catch (Exception e) {
            log.error("Error creating appointment for vehicle ID: {}", requestDto.getVehicleId(), e);
            throw new RuntimeException("Failed to create appointment: " + e.getMessage());
        }
    }

    private RepairAppointmentRequest createAppointmentEntity(AppointmentRequestDto requestDto,
                                                             VehicleDataDto vehicleData,
                                                             FastApiResponseDto fastApiResponse,
                                                             LocalDate lastServiceLocalDate) {
        RepairAppointmentRequest appointment = new RepairAppointmentRequest();

        // Set vehicle data
        appointment.setVehicleId(vehicleData.getVehicleId());
        appointment.setNoPlate(vehicleData.getNoPlate());
        appointment.setChaseNo(vehicleData.getChaseNo());
        appointment.setVehicleType(vehicleData.getVehicleType());
        appointment.setVehicleBrand(vehicleData.getVehicleBrand());
        appointment.setCustomerId(vehicleData.getCustomerId());
        appointment.setCustomerPhone(vehicleData.getCustomerPhone());
        appointment.setCustomerName(vehicleData.getCustomerName());
        appointment.setMillage(vehicleData.getMillage());
        appointment.setLastServiceDate(lastServiceLocalDate); // Use the converted LocalDate
        appointment.setVehicleModelYear(vehicleData.getVehicleModelYear());
        appointment.setVehicleRegistrationYear(vehicleData.getVehicleRegistrationYear());

        // Set user provided data
        appointment.setManualStartDate(requestDto.getManualStartDate());
        appointment.setRepairType(requestDto.getRepairType());
        appointment.setDescription(requestDto.getDescription());

        // Set prediction data - handle null response gracefully
        if (fastApiResponse != null) {
            appointment.setSuggestedStartDate(fastApiResponse.getSuggestedStartDate());
            appointment.setPredictedDuration(fastApiResponse.getPredictedDuration());
            appointment.setConfidence(fastApiResponse.getConfidence());
        } else {
            // Set default values if FastAPI is unavailable
            appointment.setSuggestedStartDate(requestDto.getManualStartDate());
            appointment.setPredictedDuration(5); // default 5 days
            appointment.setConfidence(0.0); // 0% accuracy for fallback
            log.warn("Our Model took rest for a while, using default values");
        }

        // Set initial status
        appointment.setStatus(AppointmentStatus.PENDING);

        return appointment;
    }

    // ... rest of your methods remain the same
    public List<AppointmentResponseDto> getAllAppointments() {
        return appointmentRepository.findAll().stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    public AppointmentResponseDto getAppointmentById(Long id) {
        RepairAppointmentRequest appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
        return convertToResponseDto(appointment);
    }

    public List<AppointmentResponseDto> getAppointmentsByVehicleId(String vehicleId) {
        return appointmentRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponseDto updateAppointmentStatus(Long id, AppointmentStatus status) {
        RepairAppointmentRequest appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));

        appointment.setStatus(status);
        RepairAppointmentRequest updatedAppointment = appointmentRepository.save(appointment);

        return convertToResponseDto(updatedAppointment);
    }

    private AppointmentResponseDto convertToResponseDto(RepairAppointmentRequest appointment) {
        AppointmentResponseDto response = new AppointmentResponseDto();
        response.setId(appointment.getId());
        response.setVehicleId(appointment.getVehicleId());
        response.setNoPlate(appointment.getNoPlate());
        response.setCustomerName(appointment.getCustomerName());
        response.setCustomerPhone(appointment.getCustomerPhone());
        response.setRepairType(appointment.getRepairType());
        response.setDescription(appointment.getDescription());
        response.setManualStartDate(appointment.getManualStartDate());
        response.setSuggestedStartDate(appointment.getSuggestedStartDate());
        response.setPredictedDuration(appointment.getPredictedDuration());
        response.setConfidence(appointment.getConfidence());
        response.setStatus(appointment.getStatus().name());
        response.setCreatedAt(appointment.getCreatedAt());
        response.setMillage(appointment.getMillage());
        response.setVehicleBrand(appointment.getVehicleBrand());
        response.setChaseNo(appointment.getChaseNo());
        response.setVehicleModelYear(appointment.getVehicleModelYear());
        response.setVehicleRegistrationYear(appointment.getVehicleRegistrationYear());
        response.setLastServiceDate(appointment.getLastServiceDate());
        response.setVehicleType(appointment.getVehicleType());
        return response;
    }

}
