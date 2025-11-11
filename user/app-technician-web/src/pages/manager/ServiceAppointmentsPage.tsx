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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState<number | 'ALL'>(10);

  const fetchAppointments = useCallback(async () => {
    try {
      setError('');
      setLoading(true);
      const effectivePerPage = perPage === 'ALL' ? Number.MAX_SAFE_INTEGER : perPage;
      const response = await managerService.getServiceAppointments(
        [ServiceAppointmentStatus.NEW],
        perPage === 'ALL' ? 1 : currentPage,
        effectivePerPage
      );
      setAppointmentsResponse(response);
      const totalPages = response.meta?.pages || 1;
      if (response.meta?.pages && currentPage > totalPages && perPage !== 'ALL') {
        setCurrentPage(Math.max(1, totalPages));
      }
    } catch (err) {
      setError('Failed to fetch appointments.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage]);

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
      fetchAppointments();
    } catch (err) {
        alert('Failed to assign technician');
    }
  };

  const totalRecords = appointmentsResponse?.meta?.total ?? 0;
  const totalPages = appointmentsResponse?.meta?.pages ?? 1;
  const showingFrom = !appointmentsResponse ? 0 : (appointmentsResponse.meta.page - 1) * appointmentsResponse.meta.perPage + 1;
  const showingTo = !appointmentsResponse
    ? 0
    : showingFrom + appointmentsResponse.data.length - 1;

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === 'ALL') {
      setPerPage('ALL');
      setCurrentPage(1);
    } else {
      setPerPage(Number(value));
      setCurrentPage(1);
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
            {appointmentsResponse && appointmentsResponse.data.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600">
                  Showing {showingFrom}-{showingTo} of {totalRecords}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    Rows per page
                    <select
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      value={perPage === 'ALL' ? 'ALL' : perPage}
                      onChange={handlePerPageChange}
                    >
                      {[10, 20, 50].map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="ALL">All</option>
                    </select>
                  </label>
                  {perPage !== 'ALL' && (
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {appointmentsResponse.meta.page} of {totalPages}
                      </span>
                      <button
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
