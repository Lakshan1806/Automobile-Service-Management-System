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
    
    // This will be set by the producer
    private String serviceName; 

    private String eventName; // "APPOINTMENT_CREATED", "USER_LOGGED_IN", etc.
    private String status;    // "SUCCESS", "FAILURE", or "INFO"
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    // This is the dynamic part where we can put anything
    private Map<String, Object> payload;
    
    private String traceId; // To link events from one request
    private ErrorPayload error;

    // A small helper class for errors
    @Data
    @Builder
    public static class ErrorPayload {
        private String code;
        private String message;
    }
}