package com.example.authservice.service;

import com.example.authservice.config.AdminProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.Nullable;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AdminNotificationService {

    private static final Logger log = LoggerFactory.getLogger(AdminNotificationService.class);

    private final JavaMailSender mailSender;
    private final AdminProperties adminProperties;

    public AdminNotificationService(JavaMailSender mailSender, AdminProperties adminProperties) {
        this.mailSender = mailSender;
        this.adminProperties = adminProperties;
    }

    public void sendNewAdminPassword(String recipientEmail, String rawPassword) {
        if (!StringUtils.hasText(recipientEmail)) {
            log.warn("No recipient email configured for admin bootstrap notification");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        setFromIfPresent(message, adminProperties.getMailFrom());
        message.setSubject("Your Automobile Service admin account");
        message.setText("""
                Hello,

                A default administrator account was created for the Automobile Service Management System.
                You can sign in using this email address and the temporary password shown below:

                %s

                Please change this password immediately after logging in.

                -- Automobile Service Platform
                """.formatted(rawPassword));
        try {
            mailSender.send(message);
        } catch (MailException ex) {
            log.error("Failed to send admin bootstrap email: {}", ex.getMessage());
        }
    }

    private void setFromIfPresent(SimpleMailMessage message, @Nullable String from) {
        if (StringUtils.hasText(from)) {
            message.setFrom(from);
        }
    }
}
