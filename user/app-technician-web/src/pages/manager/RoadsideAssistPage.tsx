import React, { useState, useEffect, useCallback } from 'react';
import { managerService } from '../../services/api';
import { RoadsideAppointment, PaginatedResponse, RoadsideAppointmentStatus } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import { MapPinIcon } from '@heroicons/react/24/outline';

const RoadsideAssistPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'new' | 'active'>('new');
    const [appointmentsResponse, setAppointmentsResponse] = useState<PaginatedResponse<RoadsideAppointment> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const statusesToFetch = activeTab === 'new'
                ? [RoadsideAppointmentStatus.NEW]
                : [RoadsideAppointmentStatus.ASSIGNED, RoadsideAppointmentStatus.EN_ROUTE, RoadsideAppointmentStatus.ON_SITE];
            const response = await managerService.getRoadsideAppointments(statusesToFetch, 1, 10);
            setAppointmentsResponse(response);
        } catch (err) {
            setError('Failed to fetch roadside appointments.');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);
    
    const TabButton: React.FC<{tabName: 'new' | 'active', children: React.ReactNode}> = ({tabName, children}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-2 px-4 text-sm font-medium rounded-t-lg whitespace-nowrap ${
                activeTab === tabName 
                ? 'border-b-2 border-brand-blue text-brand-blue' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Roadside Assistance</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <TabButton tabName="new">New Requests</TabButton>
                    <TabButton tabName="active">Active & Assigned</TabButton>
                </nav>
            </div>

            <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    {loading && <p className="p-4">Loading...</p>}
                    {error && <p className="p-4 text-red-500">{error}</p>}
                    {appointmentsResponse && appointmentsResponse.data.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer & Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
                                    {activeTab === 'active' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {appointmentsResponse.data.map((appt) => (
                                    <tr key={appt.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appt.ticketNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{appt.customer.name}</div>
                                            <div className="text-sm text-gray-500 flex items-center"><MapPinIcon className="h-4 w-4 mr-1 flex-shrink-0"/><span>{appt.location.address}</span></div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{appt.issueType}</td>
                                        {activeTab === 'active' && <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{appt.assignedTech?.name || 'N/A'}</td>}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusChip status={appt.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {activeTab === 'new' ? (
                                                <button className="bg-brand-gold text-brand-blue-dark px-3 py-1 rounded-md hover:bg-brand-gold-dark text-xs font-semibold">
                                                    Assign Tech
                                                </button>
                                            ) : (
                                                <button className="text-brand-blue hover:underline text-xs">View on Map</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        !loading && <p className="p-4 text-gray-500">No {activeTab} roadside requests found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoadsideAssistPage;