import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { AdminBranch, AdminBranchCreateInput } from '../../types';
import {
  PencilIcon,
  TrashIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import AddBranchModal from './components/AddBranchModal';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<AdminBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<AdminBranch | null>(null);
  const [editingBranch, setEditingBranch] = useState<AdminBranch | null>(null);
  const { addToast } = useToast();

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getBranches();
      setBranches(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch branches.');
      addToast('Failed to fetch branches', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Add branch
  const handleSaveBranch = async (branchData: AdminBranchCreateInput) => {
    try {
      await adminService.addBranch(branchData);
      setIsAddModalOpen(false);
      fetchBranches();
      addToast('Branch added successfully!', 'success');
    } catch (err) {
      addToast('Failed to save branch.', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (branch: AdminBranch) => {
    setEditingBranch(branch);
    setIsEditModalOpen(true);
  };

  // Update branch
  const handleEditBranch = async (updatedData: AdminBranchCreateInput) => {
    if (!editingBranch) return;
    try {
      await adminService.updateBranch(editingBranch.id, updatedData);
      setIsEditModalOpen(false);
      setEditingBranch(null);
      fetchBranches();
      addToast('Branch updated successfully!', 'success');
    } catch (err) {
      addToast('Failed to update branch.', 'error');
    }
  };

  // Delete branch
  const openDeleteModal = (branch: AdminBranch) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteBranch = async () => {
    if (!selectedBranch) return;
    try {
      await adminService.deleteBranch(selectedBranch.id);
      setIsDeleteModalOpen(false);
      setSelectedBranch(null);
      fetchBranches();
      addToast('Branch deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete branch.', 'error');
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Manage Branches
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark w-full sm:w-auto"
        >
          <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
          Add Branch
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading && <p className="p-4">Loading...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}
          {branches.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manager
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {branch.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {branch.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {branch.managerName ? (
                        <>
                          <div>{branch.managerName}</div>
                          <div className="text-xs text-gray-400">
                            {branch.managerEmail}
                          </div>
                        </>
                      ) : (
                        'Unassigned'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(branch)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(branch)}
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
          {!loading && !error && branches.length === 0 && (
            <p className="p-4 text-gray-500">No branches found.</p>
          )}
        </div>
      </div>

      {/* Add Branch Modal */}
      <AddBranchModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveBranch}
      />

      {editingBranch && (
        <AddBranchModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditBranch}
          initialData={editingBranch}  // ✅ Add this line
          key={editingBranch.id}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedBranch && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteBranch}
          title="Delete Branch"
          message={`Are you sure you want to delete the ${selectedBranch.name} branch? This action is permanent.`}
        />
      )}
    </div>
  );
};

export default BranchesPage;
