// In "audit-spring-boot-starter" project
// com.nivethan.audit.AuditAutoConfiguration.java
package com.nivethan.audit;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.kafka.core.KafkaTemplate;

@AutoConfiguration
// We need Kafka to be set up *before* this, so we import its auto-configuration
@Import(KafkaAutoConfiguration.class)
public class AuditAutoConfiguration {

    // This @Bean method runs automatically when any app
    // includes this "starter" as a dependency.
    @Bean
    public AuditProducerService auditProducerService(KafkaTemplate<String, StandardAuditEvent> kafkaTemplate) {
        return new AuditProducerService(kafkaTemplate);
    }
}