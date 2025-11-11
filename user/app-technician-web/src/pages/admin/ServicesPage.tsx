import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { AdminServiceItem, AdminServiceCreateInput } from '../../types';
import { Cog8ToothIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddServiceModal from './components/AddServiceModal';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<AdminServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminServiceItem | null>(null);
  const [editingService, setEditingService] = useState<AdminServiceItem | null>(null);
  const { addToast } = useToast();

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getServices();
      setServices(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch services.');
      addToast('Failed to fetch services.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSaveService = async (serviceData: AdminServiceCreateInput) => {
    try {
      if (editingService) {
        await adminService.updateService(editingService.id, serviceData);
        addToast('Service updated successfully!', 'success');
      } else {
        await adminService.addService(serviceData);
        addToast('Service added successfully!', 'success');
      }
      setIsAddModalOpen(false);
      setEditingService(null);
      fetchServices(); // refresh list
    } catch (err) {
      addToast('Failed to save service.', 'error');
    }
  };

  const openDeleteModal = (service: AdminServiceItem) => {
    setSelectedService(service);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    try {
      await adminService.deleteService(selectedService.id);
      setIsDeleteModalOpen(false);
      setSelectedService(null);
      fetchServices();
      addToast('Service deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete service.', 'error');
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (service: AdminServiceItem) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Manage Services</h1>
        <button
          onClick={() => {
            setEditingService(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark w-full sm:w-auto"
        >
          <Cog8ToothIcon className="h-5 w-5 mr-2" />
          Add Service
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading && <p className="p-4">Loading...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}
          {services.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (LKR)</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-md">{service.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{service.price.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(service)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(service)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && services.length === 0 && (
            <p className="p-4 text-gray-500">No services found.</p>
          )}
        </div>
      </div>

      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
        }}
        onSave={handleSaveService}
        key={editingService?.id || 'new'} // force re-render for edit
      />
      {selectedService && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteService}
          title="Delete Service"
          message={`Are you sure you want to delete the "${selectedService.name}" service?`}
        />
      )}
    </div>
  );
};

export default ServicesPage;
