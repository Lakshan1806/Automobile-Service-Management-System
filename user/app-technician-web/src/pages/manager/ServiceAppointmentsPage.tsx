import React, { useState, useEffect, useCallback } from 'react';
import { managerService } from '../../services/api';
import { ServiceAppointment, PaginatedResponse, ServiceAppointmentStatus } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import AssignTechnicianModal from './components/AssignTechnicianModal';

const ServiceAppointmentsPage: React.FC = () => {
  const [appointmentsResponse, setAppointmentsResponse] = useState<PaginatedResponse<ServiceAppointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<ServiceAppointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managerService.getServiceAppointments([ServiceAppointmentStatus.NEW], 1, 10);
      setAppointmentsResponse(response);
    } catch (err) {
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleOpenAssignModal = (appointment: ServiceAppointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const handleAssign = async (appointmentId: string, techId: string) => {
    try {
      await managerService.assignTechnician(appointmentId, techId);
      setIsModalOpen(false);
      setSelectedAppointment(null);
      // Refetch or update state to reflect the change
      fetchAppointments();
    } catch (err) {
        alert('Failed to assign technician');
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">New Service Appointments</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            {loading && <p className="p-4">Loading...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}
            {appointmentsResponse && appointmentsResponse.data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {appointmentsResponse.data.map((appt) => (
                    <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appt.customer.name}</div>
                        <div className="text-sm text-gray-500">{`${appt.vehicle.year} ${appt.vehicle.make} ${appt.vehicle.model}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.customer.phone || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(appt.preferredTime).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={appt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => handleOpenAssignModal(appt)}
                            className="bg-brand-gold text-brand-blue-dark px-3 py-1 rounded-md hover:bg-brand-gold-dark text-xs font-semibold"
                        >
                            Approve & Assign
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            !loading && <p className="p-4 text-gray-500">No new appointments found.</p>
            )}
        </div>
      </div>

      {isModalOpen && selectedAppointment && (
        <AssignTechnicianModal
          appointment={selectedAppointment}
          onClose={() => setIsModalOpen(false)}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};

export default ServiceAppointmentsPage;
