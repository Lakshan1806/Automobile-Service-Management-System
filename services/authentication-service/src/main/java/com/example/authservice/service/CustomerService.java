package com.example.authservice.service;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.CustomerResponse;
import com.example.authservice.dto.LoginRequest;
import com.example.authservice.dto.SignupRequest;
import com.example.authservice.model.Customer;
import com.example.authservice.repository.CustomerRepository;
import com.example.authservice.security.JwtTokenService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public CustomerService(
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenService jwtTokenService) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    public CustomerResponse register(SignupRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        String hashedPassword = passwordEncoder.encode(request.getPassword());
        Customer customer = new Customer(request.getName(), request.getEmail(), hashedPassword);
        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
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

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getEmail()
            
        );
    }
}
