import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import { useAuthStore } from './store/authStore';
import Homepage from './pages/Homepage';
import HotelDetailPage from './pages/HotelDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PaymentResultPage from './pages/PaymentResultPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import VerifyOtpPage from './pages/VerifyOtpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AwaitEmailConfirmationPage from './pages/AwaitEmailConfirmationPage';
import DashboardOverviewSimple from './pages/DashboardOverviewSimple';

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const HotelManagement = lazy(() => import('./pages/HotelManagement'));
const RoomManagement = lazy(() => import('./pages/RoomManagement'));
const BookingManagement = lazy(() => import('./pages/BookingManagement'));
const VoucherManagement = lazy(() => import('./pages/VoucherManagement'));
const EvaluationManagement = lazy(() => import('./pages/EvaluationManagement'));
const PaymentManagement = lazy(() => import('./pages/PaymentManagement'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Spin size="large" />
  </div>
);

const LoginRedirect: React.FC = () => {
  const { user } = useAuthStore();
  
  if (user?.userType === 'GUEST') {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRoles?: string[] }> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.userType === 'GUEST') {
    return <Navigate to="/404" replace />;
  }
  
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.userType)) {
    return <Navigate to="/404" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
        },
      }}
    >
      <Router>
        <div className="App">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/hotel/:id" element={<HotelDetailPage />} />
              <Route path="/booking/:hotelId" element={<BookingPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/payment/result" element={<PaymentResultPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/await-email" element={<AwaitEmailConfirmationPage />} />
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <LoginRedirect /> : <LoginPage />
                } 
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? <LoginRedirect /> : <RegisterPage />
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Suspense fallback={<LoadingFallback />}>
                      <DashboardLayout />
                    </Suspense>
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardOverviewSimple />} />
                <Route 
                  path="users" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="hotels" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN']}>
                      <HotelManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="rooms" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']}>
                      <RoomManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="bookings" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']}>
                      <BookingManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="vouchers" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN', 'MANAGER', 'STAFF']}>
                      <VoucherManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="evaluations" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN']}>
                      <EvaluationManagement />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="payments" 
                  element={
                    <ProtectedRoute requiredRoles={['SYSTEM_ADMIN', 'ADMIN']}>
                      <PaymentManagement />
                    </ProtectedRoute>
                  } 
                />
              </Route>
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ConfigProvider>
  );
}

export default App;