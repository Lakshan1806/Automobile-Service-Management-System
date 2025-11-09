import React, { useState, useEffect, useCallback } from 'react';
import { managerService } from '../../services/api';
import { Invoice, PaginatedResponse, InvoiceStatus } from '../../types';
import StatusChip from '../../components/ui/StatusChip';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { EnvelopeIcon } from '@heroicons/react/24/solid';
import { useToast } from '../../context/ToastContext';
import SendInvoiceModal from './components/SendInvoiceModal';

const InvoicesPage: React.FC = () => {
  const [invoicesResponse, setInvoicesResponse] = useState<PaginatedResponse<Invoice> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { addToast } = useToast();

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await managerService.getInvoices(1, 10);
      setInvoicesResponse(response);
    } catch (err) {
      setError('Failed to fetch invoices.');
      addToast('Failed to fetch invoices.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const openSendModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleSendInvoice = async () => {
    if (!selectedInvoice) return;
    try {
        await managerService.updateInvoiceStatus(selectedInvoice.id, InvoiceStatus.SENT);
        setIsModalOpen(false);
        setSelectedInvoice(null);
        fetchInvoices();
        addToast('Invoice sent successfully!', 'success');
    } catch (err) {
        addToast('Failed to send invoice.', 'error');
        setIsModalOpen(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Payments & Invoices</h1>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            {loading && <p className="p-4">Loading...</p>}
            {error && <p className="p-4 text-red-500">{error}</p>}
            {invoicesResponse && invoicesResponse.data.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {invoicesResponse.data.map((invoice) => (
                    <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNo}</div>
                        <div className="text-sm text-gray-500">Appt: {invoice.appointmentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{invoice.customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${invoice.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip status={invoice.status} />
                        {invoice.sendHistory && invoice.sendHistory.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <EnvelopeIcon className="h-3 w-3 mr-1" /> Sent {new Date(invoice.sendHistory[0].date).toLocaleDateString()}
                            </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-brand-blue hover:underline text-xs mr-4">View</button>
                        {invoice.status === 'READY' && (
                            <button 
                                onClick={() => openSendModal(invoice)}
                                className="bg-brand-blue text-white px-3 py-1 rounded-md hover:bg-brand-blue-dark text-xs font-semibold inline-flex items-center"
                            >
                            <PaperAirplaneIcon className="h-3 w-3 mr-1"/> Send Email
                            </button>
                        )}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            ) : (
            !loading && <p className="p-4 text-gray-500">No invoices found.</p>
            )}
        </div>
      </div>
      {selectedInvoice && (
        <SendInvoiceModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConfirm={handleSendInvoice}
            invoice={selectedInvoice}
        />
      )}
    </div>
  );
};

export default InvoicesPage;