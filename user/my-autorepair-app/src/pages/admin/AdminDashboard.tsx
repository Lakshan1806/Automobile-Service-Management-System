
import React from 'react';
import { UsersIcon, BuildingStorefrontIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

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


const AdminDashboard: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Employees" value="5" icon={<UsersIcon className="h-6 w-6"/>} />
        <StatCard title="Total Branches" value="2" icon={<BuildingStorefrontIcon className="h-6 w-6"/>} />
        <StatCard title="Today's Appointments" value="12" icon={<WrenchScrewdriverIcon className="h-6 w-6"/>} />
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
        <p className="text-gray-600 mt-2">Activity log placeholder.</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
