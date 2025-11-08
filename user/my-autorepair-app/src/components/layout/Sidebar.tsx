import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { WrenchScrewdriverIcon, UsersIcon, BuildingStorefrontIcon, CalendarDaysIcon, DocumentChartBarIcon, UserGroupIcon, Cog8ToothIcon, ArchiveBoxIcon, TruckIcon, CurrencyDollarIcon, IdentificationIcon, UserCircleIcon, DocumentCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const iconClass = "h-6 w-6 mr-3 flex-shrink-0";

const adminNav = [
  { name: 'Dashboard', to: '/admin', icon: <DocumentChartBarIcon className={iconClass} /> },
  { name: 'Employees', to: '/admin/employees', icon: <UsersIcon className={iconClass} /> },
  { name: 'Branches', to: '/admin/branches', icon: <BuildingStorefrontIcon className={iconClass} /> },
  { name: 'Services', to: '/admin/services', icon: <Cog8ToothIcon className={iconClass} /> },
  { name: 'Products', to: '/admin/products', icon: <ArchiveBoxIcon className={iconClass} /> },
];

const managerNav = [
  { name: 'Dashboard', to: '/manager', icon: <DocumentChartBarIcon className={iconClass} /> },
  { name: 'Technicians', to: '/manager/technicians', icon: <UserGroupIcon className={iconClass} /> },
  { name: 'New Appointments', to: '/manager/appointments/service/new', icon: <WrenchScrewdriverIcon className={iconClass} /> },
  { name: 'Assigned Appointments', to: '/manager/appointments/service/assigned', icon: <WrenchScrewdriverIcon className="h-6 w-6 mr-3 text-green-400" /> },
  { name: 'Roadside Assist', to: '/manager/roadside', icon: <TruckIcon className={iconClass} /> },
  { name: 'Invoices', to: '/manager/invoices', icon: <CurrencyDollarIcon className={iconClass} /> },
  { name: 'Customers', to: '/manager/customers', icon: <IdentificationIcon className={iconClass} /> },
];

const technicianNav = [
  { name: 'Dashboard', to: '/technician', icon: <DocumentChartBarIcon className={iconClass} /> },
  { name: 'My Appointments', to: '/technician/appointments', icon: <CalendarDaysIcon className={iconClass} /> },
  { name: 'Roadside', to: '/technician/roadside', icon: <TruckIcon className={iconClass} /> },
  { name: 'Calendar', to: '/technician/calendar', icon: <CalendarDaysIcon className={iconClass} /> },
  { name: 'Timesheets', to: '/technician/timesheets', icon: <DocumentCheckIcon className={iconClass} /> },
  { name: 'Profile', to: '/technician/profile', icon: <UserCircleIcon className={iconClass} /> },
];

const navLinks = {
  [Role.ADMIN]: adminNav,
  [Role.MANAGER]: managerNav,
  [Role.TECHNICIAN]: technicianNav,
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const links = user ? navLinks[user.role] : [];

  const NavItem: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => (
    <NavLink
      to={to}
      end
      onClick={() => setIsOpen(false)} // Close sidebar on mobile nav click
      className={({ isActive }) =>
        `flex items-center px-4 py-2 mt-2 text-sm font-semibold transition-colors duration-200 transform rounded-md ${
          isActive
            ? 'bg-brand-gold text-brand-blue-dark'
            : 'text-gray-200 hover:text-white hover:bg-brand-blue-dark'
        }`
      }
    >
      {children}
    </NavLink>
  );

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-brand-blue text-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        <div className="flex items-center justify-between h-20 px-4 border-b border-brand-blue-dark">
            <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-8 w-8 text-brand-gold"/>
                <span className="text-2xl font-bold ml-2">AutoPro</span>
            </div>
            <button className="lg:hidden text-gray-200 hover:text-white" onClick={() => setIsOpen(false)}>
                <XMarkIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
            <nav>
                {links.map((link) => (
                    <NavItem key={link.name} to={link.to}>
                        {link.icon} <span className="truncate">{link.name}</span>
                    </NavItem>
                ))}
            </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
