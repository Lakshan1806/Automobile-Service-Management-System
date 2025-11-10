import React, { useEffect, useMemo, useState } from 'react';
import { managerService } from '../../../services/api';
import {
  PaginatedResponse,
  RoadsideAppointment,
  Technician,
  TechnicianAppointedWork,
  TechnicianRoadAssistAssignment,
  TechnicianStatus,
} from '../../../types';
import StatusChip from '../../../components/ui/StatusChip';
import { XMarkIcon, MapPinIcon } from '@heroicons/react/24/solid';

interface AssignRoadsideTechnicianModalProps {
  appointment: RoadsideAppointment;
  onClose: () => void;
  onAssign: (technicianId: string) => Promise<void>;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type TechnicianAvailabilityRow = Technician & {
  availabilityStatus: TechnicianStatus;
  conflictingWorks: TechnicianAppointedWork[];
  conflictingRoadsideAssignments: TechnicianRoadAssistAssignment[];
};

const overlapsDayWindow = (work: TechnicianAppointedWork, dayStart: Date, dayEnd: Date) => {
  const workStart = new Date(work.startDate);
  const workEnd = new Date(work.endDate);
  if (Number.isNaN(workStart.getTime()) || Number.isNaN(workEnd.getTime())) {
    return false;
  }
  return workStart < dayEnd && workEnd > dayStart;
};

const isWithinDay = (assignment: TechnicianRoadAssistAssignment, dayStart: Date, dayEnd: Date) => {
  const assignedAt = new Date(assignment.assignedAt);
  if (Number.isNaN(assignedAt.getTime())) {
    return false;
  }
  return assignedAt >= dayStart && assignedAt < dayEnd;
};

const AssignRoadsideTechnicianModal: React.FC<AssignRoadsideTechnicianModalProps> = ({
  appointment,
  onClose,
  onAssign,
}) => {
  const [techResponse, setTechResponse] = useState<PaginatedResponse<Technician> | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigningTechId, setAssigningTechId] = useState<string | null>(null);

  const appointmentDayWindow = useMemo(() => {
    const reference = appointment.createdAt ? new Date(appointment.createdAt) : new Date();
    const dayStart = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
    const dayEnd = new Date(dayStart.getTime() + DAY_IN_MS);
    return { dayStart, dayEnd };
  }, [appointment.createdAt]);

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

  const techniciansForAppointment = useMemo<TechnicianAvailabilityRow[]>(() => {
    if (!techResponse?.data) {
      return [];
    }

    return techResponse.data
      .map((tech) => {
        const conflictingWorks = tech.appointedWorks.filter((work) =>
          overlapsDayWindow(work, appointmentDayWindow.dayStart, appointmentDayWindow.dayEnd)
        );
        const conflictingRoadsideAssignments = (tech.roadAssistAssignments || []).filter((assignment) =>
          isWithinDay(assignment, appointmentDayWindow.dayStart, appointmentDayWindow.dayEnd)
        );
        const availabilityStatus =
          conflictingWorks.length === 0 && conflictingRoadsideAssignments.length === 0
            ? TechnicianStatus.AVAILABLE
            : TechnicianStatus.BUSY;

        return {
          ...tech,
          availabilityStatus,
          conflictingWorks,
          conflictingRoadsideAssignments,
        };
      })
      .sort((a, b) => {
        if (a.availabilityStatus === b.availabilityStatus) {
          return a.name.localeCompare(b.name);
        }
        return a.availabilityStatus === TechnicianStatus.AVAILABLE ? -1 : 1;
      });
  }, [techResponse, appointmentDayWindow]);

  const handleAssignClick = async (technicianId: string) => {
    try {
      setAssigningTechId(technicianId);
      await onAssign(technicianId);
    } finally {
      setAssigningTechId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Assign Tech for {appointment.ticketNo}</h3>
            <p className="text-sm text-gray-500 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              {appointment.location.address}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="mb-4 text-sm text-gray-600">
            <p><span className="font-semibold">Customer:</span> {appointment.customer.name}</p>
            <p><span className="font-semibold">Issue:</span> {appointment.issueType}</p>
          </div>
          {loading ? (
            <p>Loading technicians...</p>
          ) : !techniciansForAppointment.length ? (
            <p className="text-sm text-gray-500">No technicians available right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Technician</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {techniciansForAppointment.map((tech) => (
                    <tr key={tech.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tech.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusChip status={tech.availabilityStatus} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tech.availabilityStatus === TechnicianStatus.AVAILABLE ? (
                          'Available now'
                        ) : (
                          <div className="space-y-1">
                            {tech.conflictingWorks.length > 0 && (
                              <div className="text-xs text-red-500">
                                Service work: {tech.conflictingWorks.map((work) => work.label).join(', ')}
                              </div>
                            )}
                            {tech.conflictingRoadsideAssignments.length > 0 && (
                              <div className="text-xs text-red-500">
                                Roadside: {tech.conflictingRoadsideAssignments.map((ra) => ra.roadAssistId).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleAssignClick(tech.id)}
                          disabled={
                            assigningTechId !== null || tech.availabilityStatus === TechnicianStatus.BUSY
                          }
                          className="bg-brand-blue text-white px-3 py-1 text-xs rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {assigningTechId === tech.id ? 'Assigning...' : 'Assign'}
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

export default AssignRoadsideTechnicianModal;
