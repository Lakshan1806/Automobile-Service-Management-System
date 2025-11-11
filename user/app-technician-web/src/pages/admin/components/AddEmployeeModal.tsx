import React, { useState, useEffect } from 'react';
import { AdminEmployeeCreateInput, AdminEmployee, Role } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: AdminEmployeeCreateInput) => Promise<void>;
  initialData?: AdminEmployee | null;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<Role>(Role.TECHNICIAN);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setPhoneNumber(initialData.phoneNumber || '');
      setRole(initialData.role);
    } else {
      setName('');
      setEmail('');
      setPhoneNumber('');
      setRole(Role.TECHNICIAN);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim(),
        role,
        phoneNumber: phoneNumber.trim() || undefined,
      });
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
        form="add-employee-form"
        disabled={isSaving}
        className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
      >
        {isSaving ? 'Saving...' : initialData ? 'Save Changes' : 'Save Employee'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Employee' : 'Add New Employee'} footer={formFooter}>
      <form id="add-employee-form" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white">
              <option value={Role.ADMIN}>Admin</option>
              <option value={Role.MANAGER}>Manager</option>
              <option value={Role.TECHNICIAN}>Technician</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;
