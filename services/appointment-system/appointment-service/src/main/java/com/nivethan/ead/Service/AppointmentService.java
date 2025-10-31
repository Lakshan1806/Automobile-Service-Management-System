package com.nivethan.ead.Service;

import com.nivethan.ead.Dto.AppointmentRequestDTO;
import com.nivethan.ead.Dto.AppointmentResponseDTO;
import com.nivethan.ead.Model.Appointment;
import com.nivethan.ead.Repository.AppointmentMapper;
import com.nivethan.ead.Repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO requestDTO){
        Appointment appointment = appointmentMapper.toEntity(requestDTO);
        Appointment savedAppointment = appointmentRepository.save(appointment);

        return appointmentMapper.toResponse(savedAppointment);
    }

}
