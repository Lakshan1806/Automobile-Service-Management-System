
import React from 'react';
import { CalendarDaysIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

const TechnicianDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Technician Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard title="Assigned Today" value="5" icon={<CalendarDaysIcon className="h-6 w-6"/>} />
        <StatCard title="In Progress" value="1" icon={<ClockIcon className="h-6 w-6"/>} />
        <StatCard title="Completed Today" value="3" icon={<CheckCircleIcon className="h-6 w-6"/>} />
      </div>

       <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Next Appointment</h2>
        <div className="mt-4 p-4 border rounded-lg">
            <p className="font-semibold">10:00 AM - Toyota Camry (ABC-123)</p>
            <p className="text-sm text-gray-600">Oil Change, Brake Inspection</p>
            <button className="mt-2 bg-brand-gold text-brand-blue-dark px-4 py-1 rounded-md hover:bg-brand-gold-dark text-sm font-semibold">Start Job</button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
