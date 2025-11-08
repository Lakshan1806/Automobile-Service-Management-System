package com.example.authservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.admin")
public class AdminProperties {

    /**
     * Email address for the default admin account. Expected to come from the environment.
     */
    private String email;

    /**
     * Toggle to disable the bootstrapper if another provisioning mechanism exists.
     */
    private boolean bootstrapEnabled = true;

    /**
     * Optional display email that will appear in the outgoing message.
     */
    private String mailFrom;

    /**
     * Length of the randomly generated password that will be emailed to the admin.
     */
    private int passwordLength = 16;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public boolean isBootstrapEnabled() {
        return bootstrapEnabled;
    }

    public void setBootstrapEnabled(boolean bootstrapEnabled) {
        this.bootstrapEnabled = bootstrapEnabled;
    }

    public String getMailFrom() {
        return mailFrom;
    }

    public void setMailFrom(String mailFrom) {
        this.mailFrom = mailFrom;
    }

    public int getPasswordLength() {
        return passwordLength;
    }

    public void setPasswordLength(int passwordLength) {
        this.passwordLength = passwordLength;
    }
}
