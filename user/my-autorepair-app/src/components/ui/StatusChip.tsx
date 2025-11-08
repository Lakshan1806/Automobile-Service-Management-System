
import React from 'react';

interface StatusChipProps {
  status: string;
}

const statusColorMap: { [key: string]: string } = {
  // Employee Status
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',

  // Appointment Status
  NEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-sky-100 text-sky-800',
  ASSIGNED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  INVOICED: 'bg-purple-100 text-purple-800',

  // Roadside Status
  EN_ROUTE: 'bg-cyan-100 text-cyan-800',
  ON_SITE: 'bg-orange-100 text-orange-800',
  TOWING: 'bg-pink-100 text-pink-800',

  // Invoice Status
  READY: 'bg-blue-100 text-blue-800',
  SENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',

  // Technician Status
  AVAILABLE: 'bg-green-100 text-green-800',
  BUSY: 'bg-red-100 text-red-800',
  OFF: 'bg-gray-100 text-gray-800',

  // Contact Method
  EMAIL: 'bg-purple-100 text-purple-800',
  PHONE: 'bg-teal-100 text-teal-800',
};

const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  const colorClass = statusColorMap[status.toUpperCase()] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default StatusChip;
