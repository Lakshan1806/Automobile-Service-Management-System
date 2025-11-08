
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { technicianService } from '../../services/api';
import { ServiceAppointment, ServiceAppointmentStatus, ServiceChecklistItem } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import { ArrowLeftIcon, CheckCircleIcon, DocumentPlusIcon, WrenchIcon, ClockIcon, PencilSquareIcon, CheckIcon, PaperClipIcon, AtSymbolIcon, PhoneIcon } from '@heroicons/react/24/outline';

const DetailCard: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b flex items-center">
            {icon}
            <h3 className="text-lg font-medium text-gray-900 ml-3">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const AppointmentDetailPage: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<ServiceAppointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [checklist, setChecklist] = useState<ServiceChecklistItem[]>([]);
    
    const fetchAppointment = useCallback(async () => {
        if (!appointmentId) return;
        try {
            setLoading(true);
            const data = await technicianService.getServiceAppointmentById(appointmentId);
            setAppointment(data);
            setChecklist(data.checklist || []);
        } catch (err) {
            setError('Failed to fetch appointment details.');
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        fetchAppointment();
    }, [fetchAppointment]);

    const handleChecklistItemChange = (itemId: string) => {
        setChecklist(prev => prev.map(item => item.id === itemId ? {...item, completed: !item.completed} : item));
    };
    
    const handleAddPart = () => {
        // Mock low stock warning
        if(Math.random() < 0.2) { // 20% chance of low stock
            alert("Warning: Stock for 'Ceramic Brake Pads (Front)' is low (2 remaining).");
        } else {
            alert("Adding parts feature is not fully implemented in this demo.");
        }
    }

    const handleCompleteWork = async () => {
        if (!appointment) return;
        if (window.confirm('Are you sure you want to mark this work order as complete?')) {
            try {
                const updated = await technicianService.updateServiceAppointmentStatus(appointment.id, ServiceAppointmentStatus.COMPLETED);
                setAppointment(updated);
                alert('Work order completed!');
            } catch (err) {
                alert('Failed to update status.');
            }
        }
    };

    if (loading) return <div className="p-6">Loading work order...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!appointment) return <div className="p-6">Appointment not found.</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-2">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Appointments
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">Work Order: {appointment.ticketNo}</h1>
                </div>
                <StatusChip status={appointment.status} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <DetailCard title="Service Checklist" icon={<CheckCircleIcon className="h-6 w-6 text-gray-500" />}>
                        <div className="space-y-3">
                            {checklist.map(item => (
                                <div key={item.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`item-${item.id}`}
                                        checked={item.completed}
                                        onChange={() => handleChecklistItemChange(item.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                                    />
                                    <label htmlFor={`item-${item.id}`} className={`ml-3 text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                        {item.task}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </DetailCard>

                     <DetailCard title="Parts Used" icon={<WrenchIcon className="h-6 w-6 text-gray-500" />}>
                        <ul className="divide-y divide-gray-200">
                          {appointment.partsUsed?.map(part => (
                            <li key={part.id} className="py-2 flex justify-between">
                                <span className="text-sm text-gray-800">{part.name} ({part.sku})</span>
                                <span className="text-sm font-medium">Qty: {part.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <button onClick={handleAddPart} className="mt-4 text-sm flex items-center text-brand-blue hover:underline">
                            <DocumentPlusIcon className="h-4 w-4 mr-1" />
                            Add Part
                        </button>
                    </DetailCard>
                    
                    <DetailCard title="Labor" icon={<ClockIcon className="h-6 w-6 text-gray-500" />}>
                         <ul className="divide-y divide-gray-200">
                          {appointment.laborEntries?.map(labor => (
                            <li key={labor.id} className="py-2 flex justify-between">
                                <span className="text-sm text-gray-800">{labor.description}</span>
                                <span className="text-sm font-medium">{labor.hours.toFixed(1)} hrs</span>
                            </li>
                          ))}
                        </ul>
                        <button className="mt-4 text-sm flex items-center text-brand-blue hover:underline">
                            <DocumentPlusIcon className="h-4 w-4 mr-1" />
                            Add Labor Entry
                        </button>
                    </DetailCard>
                </div>
                
                <div className="space-y-8">
                    <DetailCard title="Customer & Vehicle" icon={<PencilSquareIcon className="h-6 w-6 text-gray-500" />}>
                        <p className="font-semibold text-gray-900">{appointment.customer.name}</p>
                        <div className="text-sm text-gray-600 space-y-1 mt-1">
                            <p className="flex items-center"><PhoneIcon className="h-4 w-4 mr-2" />{appointment.customer.phone}</p>
                            <p className="flex items-center"><AtSymbolIcon className="h-4 w-4 mr-2" />{appointment.customer.email}</p>
                            <p>{`${appointment.customer.address.street}, ${appointment.customer.address.city}`}</p>
                        </div>
                        <hr className="my-4" />
                        <p className="font-semibold text-gray-900">{`${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`}</p>
                         <div className="text-sm text-gray-600 space-y-1 mt-1">
                            <p>Plate: {appointment.vehicle.plate}</p>
                            <p>VIN: {appointment.vehicle.vin}</p>
                            <p>Mileage: {appointment.vehicle.mileage.toLocaleString()}</p>
                            <p>Engine: {appointment.vehicle.fuelType}</p>
                            <p>Transmission: {appointment.vehicle.transmission}</p>
                        </div>
                    </DetailCard>

                     {appointment.attachments && appointment.attachments.length > 0 && (
                        <DetailCard title="Attachments" icon={<PaperClipIcon className="h-6 w-6 text-gray-500" />}>
                            <ul className="space-y-2">
                                {appointment.attachments.map(att => (
                                    <li key={att.id}>
                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-blue hover:underline">
                                            <PaperClipIcon className="h-4 w-4 mr-2" />
                                            {att.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </DetailCard>
                    )}

                     {appointment.status !== 'COMPLETED' && (
                        <div>
                             <button 
                                onClick={handleCompleteWork}
                                className="w-full flex items-center justify-center bg-brand-blue text-white px-4 py-3 rounded-md hover:bg-brand-blue-dark font-semibold">
                                <CheckIcon className="h-5 w-5 mr-2" />
                                Complete Work Order
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailPage;
