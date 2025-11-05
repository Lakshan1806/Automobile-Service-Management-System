package com.example.authservice.service;

import com.example.authservice.dto.EmployeeActivationRequest;
import com.example.authservice.dto.EmployeeAuthResponse;
import com.example.authservice.dto.EmployeeInviteRequest;
import com.example.authservice.dto.EmployeeLoginRequest;
import com.example.authservice.dto.EmployeeProfileResponse;
import com.example.authservice.model.EmployeeAccount;
import com.example.authservice.repository.EmployeeAccountRepository;
import com.example.authservice.security.JwtTokenService;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EmployeeAccountService {

    private final EmployeeAccountRepository employeeAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public EmployeeAccountService(
            EmployeeAccountRepository employeeAccountRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService) {
        this.employeeAccountRepository = employeeAccountRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @Transactional
    public EmployeeProfileResponse syncInvite(EmployeeInviteRequest request) {
        EmployeeAccount account = employeeAccountRepository
                .findByEmployeeId(request.getEmployeeId())
                .orElseGet(() -> new EmployeeAccount(
                        request.getEmployeeId(),
                        request.getEmail(),
                        request.getRole(),
                        request.getInviteToken()));

        if (account.getId() != null) {
            // Update existing record if re-invited or email/role changed
            if (!account.getEmail().equals(request.getEmail())
                    && employeeAccountRepository.existsByEmail(request.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already assigned to another employee");
            }
            account.setEmail(request.getEmail());
            account.setRole(request.getRole());
        } else if (employeeAccountRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already assigned to another employee");
        }
        account.setInviteToken(request.getInviteToken());
        // Reset activation status when a new invite is issued
        account.setPasswordHash(null);
        account.setActivatedAt(null);

        EmployeeAccount saved = employeeAccountRepository.save(account);
        return mapToProfile(saved);
    }

    @Transactional
    public EmployeeProfileResponse activate(EmployeeActivationRequest request) {
        EmployeeAccount account = employeeAccountRepository
                .findByInviteToken(request.getInviteToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invalid invite token"));

        if (account.getPasswordHash() != null && account.getActivatedAt() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invite already used");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        account.setActivatedAt(OffsetDateTime.now());
        // Invalidate token after activation
        account.setInviteToken("USED-" + account.getEmployeeId() + "-" + account.getId());

        EmployeeAccount saved = employeeAccountRepository.save(account);
        return mapToProfile(saved);
    }

    @Transactional(readOnly = true)
    public EmployeeAuthResponse login(EmployeeLoginRequest request) {
        EmployeeAccount account = employeeAccountRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (account.getPasswordHash() == null || account.getActivatedAt() == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not activated");
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        EmployeeProfileResponse profile = mapToProfile(account);
        String token = jwtTokenService.generateEmployeeToken(account);
        return new EmployeeAuthResponse(profile, token, jwtTokenService.getExpirationSeconds(), "employees", List.of(account.getRole().toUpperCase()));
    }

    @Transactional(readOnly = true)
    public EmployeeProfileResponse getById(Long id) {
        EmployeeAccount account = employeeAccountRepository
                .findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee account not found"));
        return mapToProfile(account);
    }

    private EmployeeProfileResponse mapToProfile(EmployeeAccount account) {
        return new EmployeeProfileResponse(
                account.getId(),
                account.getEmployeeId(),
                account.getEmail(),
                account.getRole(),
                account.getActivatedAt());
    }
}
