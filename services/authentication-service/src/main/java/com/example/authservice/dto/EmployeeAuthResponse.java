package com.example.authservice.dto;

public class EmployeeAuthResponse {

    private EmployeeProfileResponse employee;
    private String accessToken;
    private long expiresIn;
    private String realm;
    private java.util.List<String> roles;

    public EmployeeAuthResponse() {
    }

    public EmployeeAuthResponse(EmployeeProfileResponse employee, String accessToken, long expiresIn, String realm, java.util.List<String> roles) {
        this.employee = employee;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.realm = realm;
        this.roles = roles;
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

    public String getRealm() {
        return realm;
    }

    public void setRealm(String realm) {
        this.realm = realm;
    }

    public java.util.List<String> getRoles() {
        return roles;
    }

    public void setRoles(java.util.List<String> roles) {
        this.roles = roles;
    }
}
