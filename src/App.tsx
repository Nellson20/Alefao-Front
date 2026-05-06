import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import DriverDashboard from './pages/DriverDashboard';
import OrdersPage from './pages/OrdersPage';
import VendorsPage from './pages/VendorsPage';
import DriversPage from './pages/DriversPage';
import InventoryPage from './pages/InventoryPage';
import AvailableJobsPage from './pages/AvailableJobsPage';
import DriverOrdersPage from './pages/DriverOrdersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import CreateOrderPage from './pages/CreateOrderPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/orders/create" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <CreateOrderPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <VendorsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/drivers" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <DriversPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout role="admin">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Vendor Routes */}
          <Route path="/vendor" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <VendorDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders/create" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <CreateOrderPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor/inventory" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <InventoryPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor/notifications" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/vendor/profile" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <DashboardLayout role="vendor">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          
          {/* Driver Routes */}
          <Route path="/driver" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DashboardLayout role="driver">
                <DriverDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/jobs" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DashboardLayout role="driver">
                <AvailableJobsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/deliveries" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DashboardLayout role="driver">
                <DriverOrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/notifications" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DashboardLayout role="driver">
                <NotificationsPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/driver/settings" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DashboardLayout role="driver">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
