import React, { useState } from 'react';
import { AdminProductCreateInput } from '../../../types';
import Modal from '../../../components/ui/Modal';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: AdminProductCreateInput) => Promise<void>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        imageFile,
      });
      setName('');
      setDescription('');
      setPrice(0);
      setStock(0);
      setImageFile(null);
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
        form="add-product-form"
        disabled={isSaving}
        className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
      >
        {isSaving ? 'Saving...' : 'Save Product'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product" footer={formFooter}>
      <form id="add-product-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
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
            rows={3}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm text-gray-500"
          />
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
