
import React from 'react';
import { ClipboardDocumentListIcon, UserGroupIcon, TruckIcon } from '@heroicons/react/24/outline';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className="p-3 bg-brand-blue text-white rounded-full">
        {icon}
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ManagerDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard title="New Service Appointments" value="2" icon={<ClipboardDocumentListIcon className="h-6 w-6"/>} />
        <StatCard title="Technicians Available" value="2" icon={<UserGroupIcon className="h-6 w-6"/>} />
        <StatCard title="Active Roadside Assists" value="0" icon={<TruckIcon className="h-6 w-6"/>} />
      </div>
       <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Appointment Pipeline</h2>
        <p className="text-gray-600 mt-2">Pipeline board placeholder.</p>
      </div>
    </div>
  );
};

export default ManagerDashboard;
