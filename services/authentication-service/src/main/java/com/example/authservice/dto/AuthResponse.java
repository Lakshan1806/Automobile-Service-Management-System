package com.example.authservice.dto;

public class AuthResponse {

    private CustomerResponse customer;
    private String accessToken;
    private long expiresIn;
    private String realm;
    private java.util.List<String> roles;

    public AuthResponse() {
    }

    public AuthResponse(CustomerResponse customer, String accessToken, long expiresIn, String realm, java.util.List<String> roles) {
        this.customer = customer;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
        this.realm = realm;
        this.roles = roles;
    }

    public CustomerResponse getCustomer() {
        return customer;
    }

    public void setCustomer(CustomerResponse customer) {
        this.customer = customer;
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
