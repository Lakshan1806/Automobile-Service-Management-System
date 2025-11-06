package com.nivethan.appointmentservices.Service;

import com.nivethan.appointmentservices.Dto.AppointmentEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaAuditProducer {

    private static final String TOPIC = "appointment_events";
    private final KafkaTemplate<String, AppointmentEvent> kafkaTemplate;

    public void sendAppointmentEvent(AppointmentEvent event) {
        try {
            // Use appointmentId as the key
            String key = (event.getAppointmentId() != null) ? event.getAppointmentId().toString() : event.getVehicleId();
            log.info("Sending audit event: {} for key: {}", event.getEventType(), key);
            kafkaTemplate.send(TOPIC, key, event);
        } catch (Exception e) {
            // This is a "fire-and-forget" pattern. We log the error but
            // DO NOT stop the main appointment from being created.
            log.error("Failed to send audit event to Kafka, but continuing operation.", e);
        }
    }
}
