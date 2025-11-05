package com.example.authservice.controller;

import com.example.authservice.dto.EmployeeActivationRequest;
import com.example.authservice.dto.EmployeeAuthResponse;
import com.example.authservice.dto.EmployeeInviteRequest;
import com.example.authservice.dto.EmployeeLoginRequest;
import com.example.authservice.dto.EmployeeProfileResponse;
import com.example.authservice.service.EmployeeAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeAuthController {

    private final EmployeeAccountService employeeAccountService;

    public EmployeeAuthController(EmployeeAccountService employeeAccountService) {
        this.employeeAccountService = employeeAccountService;
    }

    @PostMapping("/invite")
    @ResponseStatus(HttpStatus.CREATED)
    public EmployeeProfileResponse createOrRefreshInvite(@Valid @RequestBody EmployeeInviteRequest request) {
        return employeeAccountService.syncInvite(request);
    }

    @PostMapping("/activate")
    public EmployeeProfileResponse activate(@Valid @RequestBody EmployeeActivationRequest request) {
        return employeeAccountService.activate(request);
    }

    @PostMapping("/login")
    public EmployeeAuthResponse login(@Valid @RequestBody EmployeeLoginRequest request) {
        return employeeAccountService.login(request);
    }

    @GetMapping("/{id}")
    public EmployeeProfileResponse getById(@PathVariable Long id) {
        return employeeAccountService.getById(id);
    }
}
