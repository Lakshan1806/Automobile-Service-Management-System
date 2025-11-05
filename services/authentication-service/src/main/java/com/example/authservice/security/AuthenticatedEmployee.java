package com.example.authservice.security;

public class AuthenticatedEmployee {

    private final Long id;
    private final Long employeeId;
    private final String email;
    private final String role;

    public AuthenticatedEmployee(Long id, Long employeeId, String email, String role) {
        this.id = id;
        this.employeeId = employeeId;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
