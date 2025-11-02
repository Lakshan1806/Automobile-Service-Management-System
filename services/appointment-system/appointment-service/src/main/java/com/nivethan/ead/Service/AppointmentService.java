package com.nivethan.ead.Service;

import com.nivethan.ead.Dto.*;
import com.nivethan.ead.Model.AppointmentStatus;
import com.nivethan.ead.Model.RepairAppointmentRequest;
import com.nivethan.ead.Repository.RepairAppointmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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
            // Step 1: Get vehicle data from vehicle microservice
            VehicleDataDto vehicleData = vehicleServiceClient.getVehicleData(requestDto.getVehicleId())
                    .block(); // Using block for simplicity, consider async in production

            if (vehicleData == null) {
                throw new RuntimeException("Vehicle not found with ID: " + requestDto.getVehicleId());
            }

            // Step 2: Prepare data for FastAPI prediction
            FastApiRequestDto fastApiRequest = new FastApiRequestDto();
            fastApiRequest.setVehicleType(vehicleData.getType());
            fastApiRequest.setRepair(requestDto.getRepairType());
            fastApiRequest.setMillage(vehicleData.getMillage().toString());
            fastApiRequest.setLastService(vehicleData.getLastServiceDate().format(DATE_FORMATTER));

            // Step 3: Get prediction from FastAPI
            FastApiResponseDto fastApiResponse = fastApiServiceClient.getSuggestedStartDate(fastApiRequest)
                    .block();

            // Step 4: Create and save appointment
            RepairAppointmentRequest appointment = new RepairAppointmentRequest();

            // Set vehicle data
            appointment.setVehicleId(vehicleData.getVehicleId());
            appointment.setNoPlate(vehicleData.getNoPlate());
            appointment.setChaseNo(vehicleData.getChaseNo());
            appointment.setVehicleType(vehicleData.getType());
            appointment.setVehicleBrand(vehicleData.getBrand());
            appointment.setCustomerId(vehicleData.getCustomerId());
            appointment.setCustomerPhone(vehicleData.getCustomerPhone());
            appointment.setCustomerName(vehicleData.getCustomerName());
            appointment.setMillage(vehicleData.getMillage());
            appointment.setLastServiceDate(vehicleData.getLastServiceDate());

            // Set user provided data
            appointment.setManualStartDate(requestDto.getManualStartDate());
            appointment.setRepairType(requestDto.getRepairType());
            appointment.setDescription(requestDto.getDescription());

            // Set prediction data
            if (fastApiResponse != null) {
                appointment.setSuggestedStartDate(fastApiResponse.getSuggestedStartDate());
                appointment.setPredictedDuration(fastApiResponse.getPredictedDuration());
                appointment.setAccuracy(fastApiResponse.getAccuracy());
            }

            // Save to database
            RepairAppointmentRequest savedAppointment = appointmentRepository.save(appointment);

            return convertToResponseDto(savedAppointment);

        } catch (Exception e) {
            log.error("Error creating appointment for vehicle ID: {}", requestDto.getVehicleId(), e);
            throw new RuntimeException("Failed to create appointment: " + e.getMessage());
        }
    }

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
        response.setAccuracy(appointment.getAccuracy());
        response.setStatus(appointment.getStatus().name());
        response.setCreatedAt(appointment.getCreatedAt());
        return response;
    }
}
