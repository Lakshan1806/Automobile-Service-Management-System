package com.nivethan.ead.Repository;
import com.nivethan.ead.Dto.AppointmentRequestDTO;
import com.nivethan.ead.Dto.AppointmentResponseDTO;
import com.nivethan.ead.Model.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel="spring")
public interface AppointmentMapper {
    Appointment toEntity(AppointmentRequestDTO requestDTO);
    AppointmentResponseDTO toResponse(Appointment appointment);
}
