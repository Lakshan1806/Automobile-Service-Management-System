package com.nivethan.appointmentservices.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.nivethan.appointmentservices.Dto.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.nivethan.appointmentservices.Model.AppointmentStatus;
import com.nivethan.appointmentservices.Model.RepairAppointmentRequest;
import com.nivethan.appointmentservices.Repository.RepairAppointmentRepository;
import com.nivethan.audit.AuditProducerService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {


    private final RepairAppointmentRepository appointmentRepository;
    private final VehicleServiceClient vehicleServiceClient;
    private final FastApiServiceClient fastApiServiceClient;

    // Spring Boot automatically finds and injects this
    // bean from your new "template" JAR
    private final AuditProducerService auditProducer;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");
    
    public Mono<List<VehicleSummaryDto>> getVehiclesForCustomer(String customerId) {
        log.info("Service: Getting vehicle summary list for customer: {}", customerId);
        return vehicleServiceClient.getVehiclesForCustomer(customerId);
    }

    @Transactional
    public FastApiResponseDto getPrediction(PredictionRequestDto requestDto, String loggedInCustomerId) {
        log.info("Getting prediction for vehicle ID: {}", requestDto.getVehicleId());

        // Step 1: Get vehicle data
        VehicleDataDto vehicleData = vehicleServiceClient.getVehicleData(requestDto.getVehicleId())
                .block();

        if (vehicleData == null) {
            throw new RuntimeException("Vehicle not found with ID: " + requestDto.getVehicleId());
        }

        // Step 2: Security Check
        if (!vehicleData.getCustomerId().equals(loggedInCustomerId)) {
            log.warn("SECURITY VIOLATION: Customer {} tried to get prediction for vehicle {} owned by {}",
                    loggedInCustomerId, vehicleData.getVehicleId(), vehicleData.getCustomerId());
            throw new AccessDeniedException("You do not have permission for this vehicle.");
        }

        // Step 3: Prepare data for FastAPI
        FastApiRequestDto fastApiRequest = new FastApiRequestDto();
        fastApiRequest.setVehicleType(vehicleData.getVehicleType());
        fastApiRequest.setVehicleBrand(vehicleData.getVehicleBrand());
        fastApiRequest.setRepairType(requestDto.getRepairType());

        // Use the mileage from the request, as it might be fresher
        fastApiRequest.setMillage(requestDto.getMillage().toString());

        LocalDate lastServiceLocalDate = vehicleData.getLastServiceDate();
        if (lastServiceLocalDate != null) {
            fastApiRequest.setLastService(lastServiceLocalDate.format(DATE_FORMATTER));
        }

        fastApiRequest.setVehicleModelYear(vehicleData.getVehicleModelYear());

        log.info("Calling FastAPI with prediction request : {}", fastApiRequest);

        // Step 4: Get and return prediction
        return fastApiServiceClient.getSuggestedStartDate(fastApiRequest)
                .block();
    }

    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto requestDto, String loggedInCustomerId) {
        String traceId = UUID.randomUUID().toString(); // Create a trace ID
        try {
            log.info("Creating appointment for vehicle ID: {}", requestDto.getVehicleId());

            // Step 1: Get vehicle data from vehicle microservice
            VehicleDataDto vehicleData = vehicleServiceClient.getVehicleData(requestDto.getVehicleId())
                    .block();

            if (vehicleData == null) {
                throw new RuntimeException("Vehicle not found with ID: " + requestDto.getVehicleId());
            }

//            Security Checks
            if (!vehicleData.getCustomerId().equals(loggedInCustomerId)) {
                log.warn("SECURITY VIOLATION: Customer {} tried to book for vehicle {} owned by {}",
                        loggedInCustomerId, vehicleData.getVehicleId(), vehicleData.getCustomerId());
                throw new AccessDeniedException("You do not have permission to make appointments for this vehicle.");
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


            // --- NEW KAFKA LOGIC (using the template) ---
            auditProducer.sendSuccessEvent(
                    "APPOINTMENT_CREATED",
                    traceId,
                    Map.of(
                            "appointmentId", savedAppointment.getId(),
                            "vehicleId", savedAppointment.getVehicleId(),
                            "repairType", savedAppointment.getRepairType(),
                            "status", savedAppointment.getStatus().name()
                    )
            );
            // --- END ---
            return convertToResponseDto(savedAppointment);

        } catch (Exception e) {
            log.error("Error creating appointment for vehicle ID: {}", requestDto.getVehicleId(), e);
            
            // --- NEW KAFKA LOGIC (using the template) ---
            auditProducer.sendFailureEvent(
                    "APPOINTMENT_FAILED",
                    traceId,
                    Map.of(
                            "vehicleId", requestDto.getVehicleId(),
                            "repairType", requestDto.getRepairType()
                    ),
                    e.getMessage().substring(0, Math.min(e.getMessage().length(), 255))
            );
            // --- END ---
            if (e instanceof AccessDeniedException) { throw (AccessDeniedException) e; } // Re-throw
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

    public AppointmentResponseDto getAppointmentById(Long id,String loggedInCustomerId) {
        log.info("Fetching appointment {} for customer {}", id, loggedInCustomerId);

        RepairAppointmentRequest appointment = appointmentRepository.findByIdAndCustomerId(id, loggedInCustomerId)
                .orElseThrow(() -> {
                    log.warn("Security: Customer {} attempted to access non-existent or unauthorized appointment {}",
                            loggedInCustomerId, id);
                    // Throw a generic "not found" to prevent attackers from guessing IDs
                    return new RuntimeException("Appointment not found with ID: " + id);
                });

        return convertToResponseDto(appointment);
    }

    public List<AppointmentResponseDto> getAppointmentsByVehicleId(String vehicleId, String loggedInCustomerId) {

        log.info("Fetching appointments for vehicle {} by customer {}", vehicleId, loggedInCustomerId);

        // Step 1: Verify the user owns this vehicle
        VehicleDataDto vehicleData = vehicleServiceClient.getVehicleData(vehicleId).block();

        if (vehicleData == null) {
            throw new RuntimeException("Vehicle not found with ID: " + vehicleId);
        }

        if (!vehicleData.getCustomerId().equals(loggedInCustomerId)) {
            log.warn("SECURITY VIOLATION: Customer {} tried to list appointments for vehicle {} owned by {}",
                    loggedInCustomerId, vehicleId, vehicleData.getCustomerId());
            throw new AccessDeniedException("You do not have permission to view appointments for this vehicle.");
        }

        // Step 2: If check passes, get the appointments
        return appointmentRepository.findByVehicleId(vehicleId).stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());


    }

    // --- MODIFY THIS METHOD ---
    @Transactional
    public AppointmentResponseDto updateAppointmentStatus(Long id, AppointmentStatus status,String loggedInCustomerId) {

        log.info("Updating status for appointment {} by customer {}", id, loggedInCustomerId);

        // First, get the appointment using the *secure* method
        RepairAppointmentRequest appointment = appointmentRepository.findByIdAndCustomerId(id, loggedInCustomerId)
                .orElseThrow(() -> {
                    log.warn("Security: Customer {} attempted to update non-existent or unauthorized appointment {}",
                            loggedInCustomerId, id);
                    return new RuntimeException("Appointment not found with ID: " + id);
                });

        // If we're here, the user is authorized.
        appointment.setStatus(status);
        RepairAppointmentRequest updatedAppointment = appointmentRepository.save(appointment);

        return convertToResponseDto(updatedAppointment);
    }

    private AppointmentResponseDto convertToResponseDto(RepairAppointmentRequest appointment) {
        AppointmentResponseDto response = new AppointmentResponseDto();
        response.setId(appointment.getId());
        response.setVehicleId(appointment.getVehicleId());
        response.setCustomerId(appointment.getCustomerId());
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
