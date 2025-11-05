package com.example.authservice.dto;

public class EmployeeAuthResponse {

    private EmployeeProfileResponse employee;
    private String accessToken;
    private long expiresIn;

    public EmployeeAuthResponse() {
    }

    public EmployeeAuthResponse(EmployeeProfileResponse employee, String accessToken, long expiresIn) {
        this.employee = employee;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
    }

    public EmployeeProfileResponse getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeProfileResponse employee) {
        this.employee = employee;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }
}
