import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GymProvider } from './context/GymContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Toast from './components/common/Toast';
import QRKioskModal from './components/qr/QRKioskModal';
import QRScannerModal from './components/qr/QRScannerModal';
import Lenis from 'lenis';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import MemberDashboard from './pages/MemberDashboard';
import MemberManagementPage from './pages/MemberManagementPage';
import TrainerManagementPage from './pages/TrainerManagementPage';
import TrainerClientsPage from './pages/TrainerClientsPage';
import TrainerWorkoutsPage from './pages/TrainerWorkoutsPage';
import TrainerNutritionPage from './pages/TrainerNutritionPage';
import AttendancePage from './pages/AttendancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import WhitelistManagement from './pages/WhitelistManagement';

// Layout Container
const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gym-darker flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex pt-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <main className="flex-1 lg:pl-64 min-w-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <Toast />
      <QRKioskModal />
      <QRScannerModal />
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gym-darker flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'rgba(201,161,90,0.3)', borderTopColor: 'transparent', borderRightColor: '#C9A15A' }} />
          <span className="text-xs font-mono" style={{ color: '#C9A15A' }}>Loading Smart Gym Platform...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Member Portal uses its dedicated full-screen editorial layout
  if (user?.role === 'member') {
    return (
      <>
        {children}
        <QRKioskModal />
        <QRScannerModal />
      </>
    );
  }

  return <MainLayout>{children}</MainLayout>;
};

// Auto Scroll to Top on page load / route navigation / reload
const ScrollToTopOnNav = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Global smooth scrolling logic
const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
};

// Dynamic Dashboard Switcher based on role
const RoleDashboardRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminDashboard />;
  if (user?.role === 'trainer') return <TrainerDashboard />;
  return <MemberDashboard />;
};

// Role-adaptive Attendance Router
const AttendanceRouter = () => {
  const { user } = useAuth();
  if (user?.role === 'member') return <MemberDashboard />;
  return <AttendancePage />;
};

function App() {
  return (
    <AuthProvider>
      <GymProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SmoothScroll />
          <ScrollToTopOnNav />
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />

            {/* Role-adaptive Central Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleDashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/members"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <MemberManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TrainerManagementPage />
                </ProtectedRoute>
              }
            />
            {/* Legacy redirect: /whitelist → /trainers */}
            <Route
              path="/whitelist"
              element={<Navigate to="/trainers" replace />}
            />

            {/* Trainer Routes */}
            <Route
              path="/clients"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerClientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plans/workouts"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerWorkoutsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/plans/nutrition"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <TrainerNutritionPage />
                </ProtectedRoute>
              }
            />

            {/* Member Routes */}
            <Route
              path="/my-workout"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-nutrition"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-progress"
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />

            {/* Universal / Shared Routes */}
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <AttendanceRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Default Catch-All */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </GymProvider>
    </AuthProvider>
  );
}

export default App;
