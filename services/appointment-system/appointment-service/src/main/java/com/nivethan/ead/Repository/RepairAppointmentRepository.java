package com.nivethan.ead.Repository;

import com.nivethan.ead.Model.AppointmentStatus;
import com.nivethan.ead.Model.RepairAppointmentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RepairAppointmentRepository extends JpaRepository<RepairAppointmentRequest, Long> {
    List<RepairAppointmentRequest> findByVehicleId(String vehicleId);
    List<RepairAppointmentRequest> findByStatus(AppointmentStatus status);
    List<RepairAppointmentRequest> findByCustomerId(String customerId);
}
