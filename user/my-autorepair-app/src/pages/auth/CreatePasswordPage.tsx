import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreatePasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white shadow-md rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Invalid Invite</h1>
          <p className="text-gray-600 mb-4">The invite link is missing or invalid.</p>
          <button
            className="text-brand-blue font-medium"
            onClick={() => navigate('/login')}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.activateEmployeeAccount(token, password);
      addToast('Password created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (error: any) {
      addToast(error?.message || 'Failed to set password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Create your password</h1>
        <p className="text-gray-600 mb-6">Set a password to activate your employee account.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-blue text-white py-2 rounded-md hover:bg-brand-blue-dark disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Set Password'}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Already activated?{' '}
          <button className="text-brand-blue font-medium" onClick={() => navigate('/login')}>
            Go to login
          </button>
        </p>
      </div>
    </div>
  );
};

export default CreatePasswordPage;
