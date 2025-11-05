package com.example.authservice;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.authservice.dto.EmployeeActivationRequest;
import com.example.authservice.dto.EmployeeAuthResponse;
import com.example.authservice.dto.EmployeeInviteRequest;
import com.example.authservice.dto.EmployeeLoginRequest;
import com.example.authservice.dto.EmployeeProfileResponse;
import com.example.authservice.model.EmployeeAccount;
import com.example.authservice.repository.EmployeeAccountRepository;
import com.example.authservice.security.JwtTokenService;
import com.example.authservice.service.EmployeeAccountService;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EmployeeAccountServiceTests {

    private static final long EMPLOYEE_ID = 501L;

    @Autowired
    private EmployeeAccountService employeeAccountService;

    @Autowired
    private EmployeeAccountRepository employeeAccountRepository;

    @Autowired
    private JwtTokenService jwtTokenService;

    @BeforeEach
    void setUp() {
        employeeAccountRepository.deleteAll();
    }

    @Test
    @Transactional
    void inviteActivateAndLoginFlowPersistsAndAuthenticatesEmployee() {
        EmployeeInviteRequest inviteRequest = new EmployeeInviteRequest();
        inviteRequest.setEmployeeId(EMPLOYEE_ID);
        inviteRequest.setEmail("tech.manager@novadrive.com");
        inviteRequest.setRole("Manager");
        inviteRequest.setInviteToken("test-token-123");

        EmployeeProfileResponse inviteResponse = employeeAccountService.syncInvite(inviteRequest);
        assertThat(inviteResponse.getEmployeeId()).isEqualTo(EMPLOYEE_ID);
        assertThat(inviteResponse.getActivatedAt()).isNull();

        EmployeeAccount persisted = employeeAccountRepository.findByEmployeeId(EMPLOYEE_ID).orElseThrow();
        assertThat(persisted.getPasswordHash()).isNull();

        EmployeeActivationRequest activationRequest = new EmployeeActivationRequest();
        activationRequest.setInviteToken("test-token-123");
        activationRequest.setPassword("VerySecure!1");

        EmployeeProfileResponse activated = employeeAccountService.activate(activationRequest);
        assertThat(activated.getActivatedAt()).isNotNull();

        EmployeeAccount activatedAccount = employeeAccountRepository.findByEmployeeId(EMPLOYEE_ID).orElseThrow();
        assertThat(activatedAccount.getPasswordHash()).isNotBlank();

        EmployeeLoginRequest loginRequest = new EmployeeLoginRequest();
        loginRequest.setEmail("tech.manager@novadrive.com");
        loginRequest.setPassword("VerySecure!1");

        EmployeeAuthResponse authResponse = employeeAccountService.login(loginRequest);
        assertThat(authResponse.getAccessToken()).isNotBlank();
        assertThat(authResponse.getEmployee().getRole()).isEqualTo("Manager");

        // Ensure generated token carries employee context
        assertThat(jwtTokenService.parseClaims(authResponse.getAccessToken())
                .get("type", String.class)).isEqualTo("employee");
    }
}
