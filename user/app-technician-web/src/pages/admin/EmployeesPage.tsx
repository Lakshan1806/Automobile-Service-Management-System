import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { AdminEmployee, AdminEmployeeCreateInput, Role } from '../../types';
import { PencilIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import AddEmployeeModal from './components/AddEmployeeModal';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const formatRole = (role: Role) => `${role.charAt(0)}${role.slice(1).toLowerCase()}`;

const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<AdminEmployee | null>(null);
  const { addToast } = useToast();

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getEmployees();
      setEmployees(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch employees.');
      addToast('Failed to fetch employees', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSaveEmployee = async (employeeData: AdminEmployeeCreateInput) => {
    try {
      await adminService.addEmployee(employeeData);
      setIsAddModalOpen(false);
      fetchEmployees(); // re-fetch to show the new employee
      addToast('Employee added successfully!', 'success');
    } catch (err) {
      addToast('Failed to save employee.', 'error');
    }
  };

  const openDeleteModal = (employee: AdminEmployee) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!selectedEmployee) return;
    try {
        await adminService.deleteEmployee(selectedEmployee.id);
        setIsDeleteModalOpen(false);
        setSelectedEmployee(null);
        fetchEmployees();
        addToast('Employee deleted successfully!', 'success');
    } catch (err) {
        addToast('Failed to delete employee.', 'error');
        setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Manage Employees</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark w-full sm:w-auto"
        >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Employee
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            {loading && <p className="p-4">Loading...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}
            {employees.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                    <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatRole(employee.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={() => openDeleteModal(employee)} className="text-red-600 hover:text-red-900"><TrashIcon className="h-5 w-5"/></button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            )}
            {!loading && !error && employees.length === 0 && (
              <p className="p-4 text-gray-500">No employees found.</p>
            )}
        </div>
      </div>
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveEmployee}
      />
      {selectedEmployee && (
        <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDeleteEmployee}
            title="Delete Employee"
            message={`Are you sure you want to delete ${selectedEmployee.name}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
