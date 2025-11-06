package com.example.authservice.dto;

import java.time.OffsetDateTime;

public class EmployeeProfileResponse {

    private Long id;
    private Long employeeId;
    private String email;
    private String role;
    private OffsetDateTime activatedAt;

    public EmployeeProfileResponse() {
    }

    public EmployeeProfileResponse(Long id, Long employeeId, String email, String role, OffsetDateTime activatedAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.email = email;
        this.role = role;
        this.activatedAt = activatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public OffsetDateTime getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(OffsetDateTime activatedAt) {
        this.activatedAt = activatedAt;
    }
}
