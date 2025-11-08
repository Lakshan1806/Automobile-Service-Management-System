import React, { useState } from 'react';
import { AdminBranchCreateInput } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface AddBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (branch: AdminBranchCreateInput) => Promise<void>;
}

const AddBranchModal: React.FC<AddBranchModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [managerId, setManagerId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        location: location.trim(),
        managerId: managerId ? Number(managerId) : undefined,
      });
      setName('');
      setLocation('');
      setManagerId('');
    } finally {
      setIsSaving(false);
    }
  };
  
   const formFooter = (
    <>
      <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
        Cancel
      </button>
      <button
        type="submit"
        form="add-branch-form"
        disabled={isSaving}
        className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
      >
        {isSaving ? 'Saving...' : 'Save Branch'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Branch" footer={formFooter}>
      <form id="add-branch-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location / Address</label>
          <textarea value={location} onChange={e => setLocation(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" rows={3} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Manager Employee ID (optional)</label>
          <input type="number" value={managerId} onChange={e => setManagerId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          <p className="text-xs text-gray-500 mt-1">Leave blank to assign later.</p>
        </div>
      </form>
    </Modal>
  );
};

export default AddBranchModal;
