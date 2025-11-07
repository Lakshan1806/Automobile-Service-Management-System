// In "audit-spring-boot-starter" project
// com.nivethan.audit.AuditProducerService.java
package com.nivethan.audit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuditProducerService {

    // 1. Dynamically get the service name from its own application.properties
    @Value("${spring.application.name}")
    private String serviceName;

    // 2. Inject the KafkaTemplate (which Spring Boot auto-creates)
    private final KafkaTemplate<String, StandardAuditEvent> kafkaTemplate;

    // 3. We make the topic configurable from application.properties
    @Value("${nivethan.audit.topic:audit_events}") // Default to "audit_events"
    private String topic;

    // 4. New "send" method.Other services will use
    public void sendEvent(String eventName, String status, String traceId, Map<String, Object> payload, String errorMessage) {

        // Build the standard event, dynamically adding the service name
        StandardAuditEvent event = StandardAuditEvent.builder()
                .serviceName(this.serviceName)
                .eventName(eventName)
                .status(status)
                .traceId(traceId)
                .payload(payload)
                .errorMessage(errorMessage)
                .build();

        try {
            log.info("Sending audit event: {} from service: {}", event.getEventName(), event.getServiceName());
            kafkaTemplate.send(topic, event.getServiceName(), event);
        } catch (Exception e) {
            log.error("Failed to send audit event to Kafka, but continuing operation.", e);
        }
    }

    // Helper methods for convenience
    public void sendSuccessEvent(String eventName, String traceId, Map<String, Object> payload) {
        sendEvent(eventName, "SUCCESS", traceId, payload, null);
    }

    public void sendFailureEvent(String eventName, String traceId, Map<String, Object> payload, String error) {
        sendEvent(eventName, "FAILURE", traceId, payload, error);
    }
}