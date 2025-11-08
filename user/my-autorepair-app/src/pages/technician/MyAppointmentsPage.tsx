import React, { useState, useEffect } from 'react';
import { technicianService } from '../../services/api';
import { ServiceAppointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import StatusChip from '../../components/ui/StatusChip';
import { Link } from 'react-router-dom';

type TabType = 'today' | 'upcoming' | 'completed';

const MyAppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('today');

  useEffect(() => {
    if (!user) return;
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // The mock API doesn't distinguish between tabs yet, it returns all assigned.
        const response = await technicianService.getMyAppointments(user.id, activeTab);
        
        // Simple mock filtering logic for tabs
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        let filtered: ServiceAppointment[] = [];
        if (activeTab === 'today') {
            filtered = response.filter(a => new Date(a.preferredTime) >= todayStart && new Date(a.preferredTime) <= todayEnd);
        } else if (activeTab === 'upcoming') {
            filtered = response.filter(a => new Date(a.preferredTime) > todayEnd);
        } else { // completed
            filtered = response.filter(a => a.status === 'COMPLETED');
        }
        setAppointments(filtered);

      } catch (err) {
        setError('Failed to fetch appointments.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user, activeTab]);

  const TabButton: React.FC<{tabName: TabType, children: React.ReactNode}> = ({tabName, children}) => (
      <button
          onClick={() => setActiveTab(tabName)}
          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tabName
              ? 'border-brand-blue text-brand-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
      >
          {children}
      </button>
  );

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">My Appointments</h1>

      <div className="mb-4 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
              <TabButton tabName="today">Today</TabButton>
              <TabButton tabName="upcoming">Upcoming</TabButton>
              <TabButton tabName="completed">Completed</TabButton>
          </nav>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            {loading && <p className="p-4">Loading...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}
            {appointments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Vehicle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Services</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appt) => (
                    <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(appt.preferredTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appt.customer.name}</div>
                        <div className="text-sm text-gray-500">{`${appt.vehicle.year} ${appt.vehicle.make} ${appt.vehicle.model}`}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{appt.requestedServices.map(s => s.name).join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={appt.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link to={`/technician/appointments/${appt.id}`} className="bg-brand-gold text-brand-blue-dark px-3 py-1 rounded-md hover:bg-brand-gold-dark text-xs font-semibold">
                        View Work Order
                        </Link>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            !loading && <p className="p-4 text-gray-500">No appointments found for this category.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyAppointmentsPage;