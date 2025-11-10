package com.example.authservice.service;

import com.example.authservice.config.SignupOtpProperties;
import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.ChangePasswordRequest;
import com.example.authservice.dto.CustomerResponse;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.SignupRequest;
import com.example.authservice.dto.SignupResponse;
import com.example.authservice.dto.UpdateCustomerRequest;
import com.example.authservice.dto.VerifySignupRequest;
import com.example.authservice.model.Customer;
import com.example.authservice.model.SignupOtp;
import com.example.authservice.repository.CustomerRepository;
import com.example.authservice.repository.SignupOtpRepository;
import com.example.authservice.security.JwtTokenService;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CustomerRepository customerRepository;
    private final SignupOtpRepository signupOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final UserProfileClient userProfileClient;
    private final JavaMailSender mailSender;
    private final SignupOtpProperties signupOtpProperties;

    public CustomerService(
            CustomerRepository customerRepository,
            SignupOtpRepository signupOtpRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService,
            UserProfileClient userProfileClient,
            JavaMailSender mailSender,
            SignupOtpProperties signupOtpProperties) {
        this.customerRepository = customerRepository;
        this.signupOtpRepository = signupOtpRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
        this.userProfileClient = userProfileClient;
        this.mailSender = mailSender;
        this.signupOtpProperties = signupOtpProperties;
    }

    /**
     * @deprecated Signup now requires OTP verification. This method is retained for backward compatibility
     * and delegates to the same validation logic used by the OTP flow.
     */
    @Deprecated(forRemoval = false)
    public CustomerResponse register(SignupRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        return persistCustomer(request.getName(), normalizeEmail(request.getEmail()), hashedPassword);
    }

    public void requestSignupOtp(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (customerRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        String otpCode = generateOtpCode();
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC)
                .plusMinutes(Math.max(1, signupOtpProperties.getExpiryMinutes()));

        SignupOtp pending = signupOtpRepository
                .findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(SignupOtp::new);
        pending.setName(request.getName());
        pending.setEmail(normalizedEmail);
        pending.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        pending.setOtpCode(otpCode);
        pending.setExpiresAt(expiresAt);
        pending.setVerified(false);
        signupOtpRepository.save(pending);

        sendOtpEmail(request.getEmail(), otpCode, request.getName());
    }

    @Transactional
    public SignupResponse verifySignupOtp(VerifySignupRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        SignupOtp pending = signupOtpRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Request a verification code before signing up"));

        if (pending.getExpiresAt().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            signupOtpRepository.delete(pending);
            throw new ResponseStatusException(HttpStatus.GONE, "Verification code has expired");
        }

        if (!pending.getOtpCode().equals(request.getOtp().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }

        if (customerRepository.existsByEmail(normalizedEmail)) {
            signupOtpRepository.delete(pending);
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        CustomerResponse customer = persistCustomer(pending.getName(), pending.getEmail(), pending.getPasswordHash());
        signupOtpRepository.delete(pending);
        return new SignupResponse(
                "Your account was created successfully.",
                customer.getName(),
                customer.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Customer customer = customerRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), customer.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        CustomerResponse customerResponse = mapToResponse(customer);
        String token = jwtTokenService.generateCustomerToken(customer);
        return new AuthResponse(customerResponse, token, jwtTokenService.getExpirationSeconds(), "customers",
                List.of("CUSTOMER"));
    }

    public CustomerResponse updateCustomerDetails(Long customerId, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        boolean emailChanged = !customer.getEmail().equalsIgnoreCase(request.getEmail());
        if (emailChanged) {
            customerRepository.findByEmail(request.getEmail())
                    .filter(existing -> !existing.getId().equals(customerId))
                    .ifPresent(existing -> {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
                    });
        }

        customer.setName(request.getName());
        customer.setEmail(request.getEmail());

        Customer updated = customerRepository.save(customer);
        return mapToResponse(updated);
    }

    public void changePassword(Long customerId, ChangePasswordRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), customer.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Current password is invalid");
        }

        if (passwordEncoder.matches(request.getNewPassword(), customer.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different");
        }

        customer.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);
    }

    public CustomerResponse getCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return mapToResponse(customer);
    }

    private CustomerResponse persistCustomer(String name, String email, String encodedPassword) {
        Customer customer = new Customer(name, email, encodedPassword);
        Customer saved = customerRepository.save(customer);
        userProfileClient.createCustomerProfile(saved.getId());
        return mapToResponse(saved);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String generateOtpCode() {
        int length = Math.max(4, signupOtpProperties.getCodeLength());
        StringBuilder builder = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            builder.append(RANDOM.nextInt(10));
        }
        return builder.toString();
    }

    private void sendOtpEmail(String recipient, String otpCode, String name) {
        if (!StringUtils.hasText(recipient)) {
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        if (StringUtils.hasText(signupOtpProperties.getMailFrom())) {
            message.setFrom(signupOtpProperties.getMailFrom());
        }
        message.setSubject("Your NovaDrive verification code");
        String greeting = StringUtils.hasText(name) ? "Hi %s,".formatted(name) : "Hello,";
        message.setText("""
                %s

                Use the verification code below to finish creating your NovaDrive account:

                %s

                The code expires in %d minutes. If you did not request it, you can safely ignore this email.

                -- NovaDrive
                """.formatted(greeting, otpCode, Math.max(1, signupOtpProperties.getExpiryMinutes())));
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Failed to send customer signup OTP email: {}", ex.getMessage());
        }
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail()
        );
    }
}
