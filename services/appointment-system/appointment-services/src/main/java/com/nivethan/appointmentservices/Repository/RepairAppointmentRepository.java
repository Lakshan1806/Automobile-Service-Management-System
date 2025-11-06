package com.nivethan.appointmentservices.Repository;

import com.nivethan.appointmentservices.Model.AppointmentStatus;
import com.nivethan.appointmentservices.Model.RepairAppointmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepairAppointmentRepository extends JpaRepository<RepairAppointmentRequest, Long> {
    List<RepairAppointmentRequest> findByVehicleId(String vehicleId);
    List<RepairAppointmentRequest> findByStatus(AppointmentStatus status);
    List<RepairAppointmentRequest> findByCustomerId(String customerId);

    /**
     * Securely finds an appointment by its ID *and* the customer's ID.
     */
    Optional<RepairAppointmentRequest> findByIdAndCustomerId(Long id, String customerId);
}
