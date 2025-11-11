
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Role } from './types';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import CreatePasswordPage from './pages/auth/CreatePasswordPage';
import SelectBranchPage from './pages/common/SelectBranchPage';
import NotFoundPage from './pages/common/NotFoundPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EmployeesPage from './pages/admin/EmployeesPage';
import BranchesPage from './pages/admin/BranchesPage';
import ServicesPage from './pages/admin/ServicesPage';
import ProductsPage from './pages/admin/ProductsPage';


// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ServiceAppointmentsPage from './pages/manager/ServiceAppointmentsPage';
import AssignedServiceAppointmentsPage from './pages/manager/AssignedServiceAppointmentsPage';
import RoadsideAssistPage from './pages/manager/RoadsideAssistPage';
import InvoicesPage from './pages/manager/InvoicesPage';
import TechniciansPage from './pages/manager/TechniciansPage';


// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import MyAppointmentsPage from './pages/technician/MyAppointmentsPage';
import AppointmentDetailPage from './pages/technician/AppointmentDetailPage';
import RoadsidePage from './pages/technician/RoadsidePage';
import ToastContainer from './components/ui/ToastContainer';
import TrackPage from './pages/technician/TrackPage';


const ProtectedRoute: React.FC<{ roles: Role[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading...</p></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!roles.includes(user.role)) {
    // Redirect to a default page or show an unauthorized message
    return <Navigate to={`/${user.role.toLowerCase()}`} replace />;
  }

  return <>{children}</>;
};


function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/create-password/:token" element={<CreatePasswordPage />} />
      <Route path="/" element={user ? <Navigate to={`/${user.role.toLowerCase()}`} /> : <Navigate to="/login" />} />

      {/* Admin Routes */}
      <Route 
        path="/admin"
        element={<ProtectedRoute roles={[Role.ADMIN]}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="branches" element={<BranchesPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>

      {/* Manager Routes */}
      <Route 
        path="/manager"
        element={<ProtectedRoute roles={[Role.MANAGER]}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<ManagerDashboard />} />
        <Route path="appointments/service/new" element={<ServiceAppointmentsPage />} />
        <Route path="appointments/service/assigned" element={<AssignedServiceAppointmentsPage />} />
        <Route path="roadside" element={<RoadsideAssistPage />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
      </Route>
      
      {/* Technician Routes */}
       <Route 
        path="/technician"
        element={<ProtectedRoute roles={[Role.TECHNICIAN]}><DashboardLayout /></ProtectedRoute>}
      >
        <Route index element={<TechnicianDashboard />} />
        <Route path="appointments" element={<MyAppointmentsPage />} />
        <Route path="appointments/:appointmentId" element={<AppointmentDetailPage />} />
        <Route path="roadside" element={<RoadsidePage />} />
        <Route path="track/:requestId" element={<TrackPage />} />
      </Route>

      <Route path="/select-branch" element={<SelectBranchPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
