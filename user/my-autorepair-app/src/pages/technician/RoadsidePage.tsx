
import React, { useState, useEffect, useCallback } from 'react';
import { technicianService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { RoadsideAppointment, RoadsideAppointmentStatus } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import { PhoneIcon, MapPinIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const statusTransitions: { [key in RoadsideAppointmentStatus]?: RoadsideAppointmentStatus } = {
    [RoadsideAppointmentStatus.ASSIGNED]: RoadsideAppointmentStatus.EN_ROUTE,
    [RoadsideAppointmentStatus.EN_ROUTE]: RoadsideAppointmentStatus.ON_SITE,
    [RoadsideAppointmentStatus.ON_SITE]: RoadsideAppointmentStatus.COMPLETED,
};

const statusActions: { [key in RoadsideAppointmentStatus]?: string } = {
    [RoadsideAppointmentStatus.ASSIGNED]: "Start & Go En Route",
    [RoadsideAppointmentStatus.EN_ROUTE]: "Arrived On Site",
    [RoadsideAppointmentStatus.ON_SITE]: "Complete Job",
};


const RoadsidePage: React.FC = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<RoadsideAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchJobs = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await technicianService.getRoadsideAppointments(user.id);
            setJobs(data);
        } catch (err) {
            setError('Failed to fetch roadside jobs.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleStatusUpdate = async (jobId: string, currentStatus: RoadsideAppointmentStatus) => {
        const nextStatus = statusTransitions[currentStatus];
        if (!nextStatus) return;

        try {
            await technicianService.updateRoadsideAppointmentStatus(jobId, nextStatus);
            // Refresh the job list to show the change
            fetchJobs();
        } catch (err) {
            alert('Failed to update job status.');
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">My Roadside Jobs</h1>

            {loading && <p className="p-4">Loading jobs...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}

            {!loading && jobs.length === 0 && (
                <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
                    You have no active roadside assistance jobs.
                </div>
            )}
            
            <div className="space-y-6">
                {jobs.map(job => (
                    <div key={job.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-gray-900">{job.issueType} - {job.ticketNo}</h3>
                                <p className="text-sm text-gray-600">{`${job.vehicle.year} ${job.vehicle.make} ${job.vehicle.model}`}</p>
                            </div>
                            <StatusChip status={job.status} />
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <p className="text-xs font-semibold text-gray-500">CUSTOMER</p>
                                <p className="text-gray-800">{job.customer.name}</p>
                            </div>
                             <div>
                                <p className="text-xs font-semibold text-gray-500">LOCATION</p>
                                <p className="text-gray-800 flex items-center"><MapPinIcon className="h-4 w-4 mr-2"/>{job.location.address}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-between items-center">
                            <a href={`tel:${job.customer.phone}`} className="inline-flex items-center text-sm font-medium text-brand-blue hover:underline">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                Call Customer
                            </a>
                             {statusActions[job.status] && (
                                <button
                                    onClick={() => handleStatusUpdate(job.id, job.status)} 
                                    className="bg-brand-gold text-brand-blue-dark px-4 py-2 rounded-md hover:bg-brand-gold-dark text-sm font-semibold inline-flex items-center">
                                    {statusActions[job.status]}
                                    <ArrowRightIcon className="h-4 w-4 ml-2" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoadsidePage;
