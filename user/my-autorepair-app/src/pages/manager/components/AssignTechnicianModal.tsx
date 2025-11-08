import React, { useState, useEffect } from 'react';
import { managerService } from '../../../services/api';
import { ServiceAppointment, Technician, PaginatedResponse } from '../../../types';
import StatusChip from '../../../components/ui/StatusChip';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface AssignTechnicianModalProps {
  appointment: ServiceAppointment;
  onClose: () => void;
  onAssign: (appointmentId: string, techId: string) => Promise<void>;
}

const AssignTechnicianModal: React.FC<AssignTechnicianModalProps> = ({ appointment, onClose, onAssign }) => {
  const [techResponse, setTechResponse] = useState<PaginatedResponse<Technician> | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        setLoading(true);
        const response = await managerService.getTechnicians();
        setTechResponse(response);
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  const handleAssignClick = async (techId: string) => {
      setAssigning(true);
      await onAssign(appointment.id, techId);
      setAssigning(false);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-800">Assign Tech for #{appointment.ticketNo}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
            <p><span className="font-semibold">Customer:</span> {appointment.customer.name}</p>
            <p><span className="font-semibold">Vehicle:</span> {`${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`}</p>
          </div>
          {loading ? (
            <p>Loading technicians...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {techResponse?.data.map((tech) => (
                    <tr key={tech.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tech.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusChip status={tech.status} /></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{tech.todayLoad} jobs</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button 
                            onClick={() => handleAssignClick(tech.id)}
                            disabled={assigning}
                            className="bg-brand-blue text-white px-3 py-1 text-xs rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
                        >
                          {assigning ? 'Assigning...' : 'Assign'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t text-right flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTechnicianModal;