import React, { useState } from 'react';
import { AdminServiceCreateInput } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: AdminServiceCreateInput) => Promise<void>;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
      });
      setName('');
      setDescription('');
      setPrice(0);
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
        form="add-service-form"
        disabled={isSaving}
        className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
      >
        {isSaving ? 'Saving...' : 'Save Service'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Service" footer={formFooter}>
      <form id="add-service-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Service Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddServiceModal;
