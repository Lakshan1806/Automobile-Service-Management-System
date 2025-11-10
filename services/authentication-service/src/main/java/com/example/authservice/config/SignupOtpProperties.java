package com.example.authservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.signup-otp")
public class SignupOtpProperties {

    /**
     * Number of minutes the OTP should remain valid.
     */
    private int expiryMinutes = 10;

    /**
     * Number of digits used when generating the OTP.
     */
    private int codeLength = 6;

    /**
     * Optional "from" address used when sending OTP emails.
     */
    private String mailFrom;

    public int getExpiryMinutes() {
        return expiryMinutes;
    }

    public void setExpiryMinutes(int expiryMinutes) {
        this.expiryMinutes = expiryMinutes;
    }

    public int getCodeLength() {
        return codeLength;
    }

    public void setCodeLength(int codeLength) {
        this.codeLength = codeLength;
    }

    public String getMailFrom() {
        return mailFrom;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }
}
