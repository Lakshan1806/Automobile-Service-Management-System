import React, { useState, useEffect, useCallback } from 'react';
import { managerService } from '../../services/api';
import { ServiceAppointment, PaginatedResponse, ServiceAppointmentStatus } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const AssignedServiceAppointmentsPage: React.FC = () => {
  const [appointmentsResponse, setAppointmentsResponse] = useState<PaginatedResponse<ServiceAppointment> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const statusesToFetch = [ServiceAppointmentStatus.ASSIGNED, ServiceAppointmentStatus.IN_PROGRESS, ServiceAppointmentStatus.COMPLETED];
      const response = await managerService.getServiceAppointments(statusesToFetch, 1, 10);
      setAppointmentsResponse(response);
    } catch (err) {
      setError('Failed to fetch assigned appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Assigned & In-Progress</h1>
      
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                            <UserCircleIcon className="h-6 w-6 text-gray-400 mr-2"/>
                            <span>{appt.assignedTech?.name || 'N/A'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={appt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-brand-blue hover:underline text-xs">View Details</button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            !loading && <p className="p-4 text-gray-500">No assigned appointments found.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AssignedServiceAppointmentsPage;
