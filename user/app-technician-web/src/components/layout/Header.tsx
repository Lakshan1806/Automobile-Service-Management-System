import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowLeftOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b flex-shrink-0">
      <div className="flex items-center">
        <button
            onClick={onMenuClick}
            className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
            aria-label="Open sidebar"
        >
            <Bars3Icon className="h-6 w-6" />
        </button>
        <div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Welcome, {user?.firstName}!</h1>
            <p className="text-xs sm:text-sm text-gray-500">Role: {user?.role}</p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <UserCircleIcon className="w-8 h-8 text-gray-500" />
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 sm:ml-4 flex items-center text-sm text-gray-600 hover:text-brand-blue"
          title="Logout"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6 mr-1" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
