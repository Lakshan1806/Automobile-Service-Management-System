// File: src/test/java/com/nivethan/appointmentservices/Controller/AppointmentControllerTest.java
package com.nivethan.appointmentservices.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nivethan.appointmentservices.Dto.AppointmentRequestDto;
import com.nivethan.appointmentservices.Dto.AppointmentResponseDto;
import com.nivethan.appointmentservices.Dto.VehicleSummaryDto;
import com.nivethan.appointmentservices.Service.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult; // 👈 --- ADD THIS IMPORT
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

// --- Static Imports ---
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
// This import will work once your pom.xml is fixed and reloaded
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch; // 👈 --- ADD THIS IMPORT
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*; // 👈 --- USE WILDCARD
import static org.hamcrest.Matchers.is;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
@Import(AppointmentControllerTest.TestConfig.class)
class AppointmentControllerTest {

    // This inner class is the new, non-deprecated way to create mocks.
    @TestConfiguration
    static class TestConfig {
        @Bean
        public AppointmentService appointmentService() {
            // This mock will replace the real service in the test context
            return mock(AppointmentService.class);
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppointmentService appointmentService; // This is the MOCK from TestConfig

    @Test
    void testGetMyVehicles_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/appointments/my-vehicles"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testGetMyVehicles_Success() throws Exception {
        // 1. Arrange
        String customerId = "1";
        VehicleSummaryDto vehicle = new VehicleSummaryDto();
        vehicle.setVehicleId("v1");
        vehicle.setNoPlate("ABC-123");

        when(appointmentService.getVehiclesForCustomer(customerId)).thenReturn(Mono.just(List.of(vehicle)));

        // 2. Act
        // --- THIS IS THE FIX for the JsonPath error ---
        MvcResult mvcResult = mockMvc.perform(get("/api/appointments/my-vehicles")
                        // This syntax uses the claims to build the JWT
                        .with(jwt().jwt(jwt -> jwt.claim("sub", customerId)))
                )
                .andExpect(status().isOk())
                .andExpect(request().asyncStarted()) // 1. Expect an async request
                .andReturn(); // 2. Get the MvcResult

        // 3. Assert on the *final*, resolved response
        mockMvc.perform(asyncDispatch(mvcResult)) // 3. Perform async dispatch
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].noPlate", is("ABC-123"))); // 4. Now assert on the body
    }

    @Test
    void testCreateAppointment_Endpoint_Success() throws Exception {
        // 1. Arrange
        String customerId = "2";

        AppointmentRequestDto requestDto = new AppointmentRequestDto();
        requestDto.setVehicleId("v2");
        requestDto.setRepairType("Engine Repair");
        requestDto.setManualStartDate(LocalDate.parse("2025-12-01"));

        when(appointmentService.createAppointment(any(AppointmentRequestDto.class), eq(customerId)))
                .thenReturn(new AppointmentResponseDto());

        // 2. Act & 3. Assert
        mockMvc.perform(post("/api/appointments")
                        .with(jwt().jwt(jwt -> jwt.claim("sub", customerId))) // Use the working syntax
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                )
                .andExpect(status().isOk());
    }
}