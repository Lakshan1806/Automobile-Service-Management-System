
import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface ToastProps {
  id: number;
  message: string;
  type: 'success' | 'error';
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
    bgClass: 'bg-green-50',
    textClass: 'text-green-800',
  },
  error: {
    icon: <XCircleIcon className="h-6 w-6 text-red-500" />,
    bgClass: 'bg-red-50',
    textClass: 'text-red-800',
  },
};

const Toast: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  const { icon, bgClass, textClass } = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => {
      clearTimeout(timer);
    };
  }, [id, onDismiss]);

  return (
    <div className={`max-w-sm w-full ${bgClass} shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${textClass}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => onDismiss(id)} className="inline-flex rounded-md bg-transparent text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
