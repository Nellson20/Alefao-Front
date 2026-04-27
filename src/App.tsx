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
import ProfilePage from './pages/ProfilePage';
import CreateOrderPage from './pages/CreateOrderPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
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
