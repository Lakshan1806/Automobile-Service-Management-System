// In "audit-spring-boot-starter" project
// com.nivethan.audit.StandardAuditEvent.java
package com.nivethan.audit;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class StandardAuditEvent {

    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    // Set Service Name dynamically!
    private String serviceName;

    private String eventName; // "APPOINTMENT_CREATED", "USER_LOGGED_IN", "PAYMENT_FAILED"
    private String status;    // "SUCCESS", "FAILURE", "INFO"

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // The "dynamic" part.
    private Map<String, Object> payload;

    private String traceId; // To link multiple events from one request
    private String errorMessage;
}