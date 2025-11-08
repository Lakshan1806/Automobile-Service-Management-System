
import React from 'react';
import Modal from '../../../components/ui/Modal';
import { Invoice } from '../../../types';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface SendInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  invoice: Invoice;
}

const SendInvoiceModal: React.FC<SendInvoiceModalProps> = ({ isOpen, onClose, onConfirm, invoice }) => {
  const modalFooter = (
    <>
      <button
        type="button"
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        type="button"
        className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-brand-blue-dark inline-flex items-center"
        onClick={onConfirm}
      >
        <PaperAirplaneIcon className="h-4 w-4 mr-2" />
        Send Now
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Invoice ${invoice.invoiceNo}`} footer={modalFooter}>
        <p className="text-sm text-gray-600">
            You are about to send invoice <strong>{invoice.invoiceNo}</strong> for <strong>${invoice.total.toFixed(2)}</strong> to <strong>{invoice.customer.name}</strong>.
        </p>
        <p className="text-sm text-gray-600 mt-2">
            An email will be sent to <a href={`mailto:${invoice.customer.email}`} className="text-brand-blue underline">{invoice.customer.email}</a>.
        </p>
        <div className="mt-4">
             <label htmlFor="template" className="block text-sm font-medium text-gray-700">Email Template</label>
            <select id="template" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 bg-white">
                <option>Default Invoice Template</option>
                <option>Past Due Reminder</option>
            </select>
        </div>
    </Modal>
  );
};

export default SendInvoiceModal;
