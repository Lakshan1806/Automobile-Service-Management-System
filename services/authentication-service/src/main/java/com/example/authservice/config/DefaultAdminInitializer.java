package com.example.authservice.config;

import com.example.authservice.model.EmployeeAccount;
import com.example.authservice.repository.EmployeeAccountRepository;
import com.example.authservice.service.AdminNotificationService;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Component
public class DefaultAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultAdminInitializer.class);
    private static final long ADMIN_EMPLOYEE_ID = -1L;
    private static final String ADMIN_ROLE = "Admin";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmployeeAccountRepository employeeAccountRepository;
    private final AdminProperties adminProperties;
    private final AdminNotificationService adminNotificationService;
    private final PasswordEncoder passwordEncoder;

    public DefaultAdminInitializer(
            EmployeeAccountRepository employeeAccountRepository,
            AdminProperties adminProperties,
            AdminNotificationService adminNotificationService,
            PasswordEncoder passwordEncoder) {
        this.employeeAccountRepository = employeeAccountRepository;
        this.adminProperties = adminProperties;
        this.adminNotificationService = adminNotificationService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!adminProperties.isBootstrapEnabled()) {
            log.info("Admin bootstrapper disabled via configuration");
            return;
        }
        if (!StringUtils.hasText(adminProperties.getEmail())) {
            log.warn("Admin bootstrapper enabled but no email configured (app.admin.email). Skipping.");
            return;
        }
        boolean adminExists = employeeAccountRepository.existsByRoleIgnoreCase(ADMIN_ROLE);
        if (adminExists) {
            log.debug("Admin account already present, no bootstrap needed");
            return;
        }

        String rawPassword = generatePassword(adminProperties.getPasswordLength());
        EmployeeAccount admin = new EmployeeAccount();
        admin.setEmployeeId(ADMIN_EMPLOYEE_ID);
        admin.setEmail(adminProperties.getEmail().trim().toLowerCase());
        admin.setRole(ADMIN_ROLE);
        admin.setInviteToken("BOOTSTRAPPED-" + UUID.randomUUID());
        admin.setPasswordHash(passwordEncoder.encode(rawPassword));
        admin.setActivatedAt(OffsetDateTime.now());

        employeeAccountRepository.save(admin);
        log.info("Created default admin account with email {}", admin.getEmail());

        adminNotificationService.sendNewAdminPassword(adminProperties.getEmail(), rawPassword);
    }

    private String generatePassword(int length) {
        int targetLength = Math.max(length, 12);
        byte[] buffer = new byte[targetLength];
        RANDOM.nextBytes(buffer);
        String encoded = Base64.getUrlEncoder().withoutPadding().encodeToString(buffer);
        if (encoded.length() > targetLength) {
            return encoded.substring(0, targetLength);
        }
        if (encoded.length() < targetLength) {
            return encoded + generatePassword(targetLength - encoded.length());
        }
        return encoded;
    }
}
