package com.example.authservice.dto;

public class AuthResponse {

    private CustomerResponse customer;
    private String accessToken;
    private long expiresIn;

    public AuthResponse() {
    }

    public AuthResponse(CustomerResponse customer, String accessToken, long expiresIn) {
        this.customer = customer;
        this.accessToken = accessToken;
        this.expiresIn = expiresIn;
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
}
