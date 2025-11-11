import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../services/api';
import { AdminProduct, AdminProductCreateInput } from '../../types';
import { ArchiveBoxIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddProductModal from './components/AddProductModal';
import { useToast } from '../../context/ToastContext';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getProducts();
      setProducts(response);
      setError('');
    } catch (err) {
      setError('Failed to fetch products.');
      addToast('Failed to fetch products.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSaveProduct = async (productData: AdminProductCreateInput) => {
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, productData);
        addToast('Product updated successfully!', 'success');
      } else {
        await adminService.addProduct(productData);
        addToast('Product added successfully!', 'success');
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
      fetchProducts(); // refresh list
    } catch (err) {
      addToast('Failed to save product.', 'error');
    }
  };

  const openDeleteModal = (product: AdminProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    try {
      await adminService.deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchProducts();
      addToast('Product deleted successfully!', 'success');
    } catch (err) {
      addToast('Failed to delete product.', 'error');
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Manage Products</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center bg-brand-blue text-white px-4 py-2 rounded-md hover:bg-brand-blue-dark w-full sm:w-auto"
        >
          <ArchiveBoxIcon className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {loading && <p className="p-4">Loading...</p>}
          {error && <p className="p-4 text-red-500">{error}</p>}
          {products.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (LKR)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-md">{product.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(product)}
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
          {!loading && !error && products.length === 0 && (
            <p className="p-4 text-gray-500">No products found.</p>
          )}
        </div>
      </div>

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct} // pass to modal for pre-fill
        key={editingProduct?.id || 'new'} // force re-render for edit
      />

      {selectedProduct && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteProduct}
          title="Delete Product"
          message={`Are you sure you want to delete the product "${selectedProduct.name}"?`}
        />
      )}
    </div>
  );
};

export default ProductsPage;
