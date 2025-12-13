// App.jsx - Main React Application (FIXED)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import idID from 'antd/locale/id_ID';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import CreateUser from './pages/admin/CreateUser';
import EditUser from './pages/admin/EditUser';
import ImportData from './pages/admin/ImportData';
import MonitoringReport from './pages/admin/MonitoringReport';
// ▼▼▼ TAMBAHKAN IMPORT BERIKUT ▼▼▼
import ImportSchedules from './pages/admin/ImportSchedules';
import ImportStudents from './pages/admin/ImportStudents';
import ImportThesisProjects from './pages/admin/ImportThesisProjects'; // Asumsi nama file ini
// ▲▲▲ -------------------------- ▲▲▲

// Dosen Pages
import DosenDashboard from './pages/dosen/DosenDashboard';
import DosenSchedule from './pages/dosen/DosenSchedule';
import AddSchedule from './pages/dosen/AddSchedule';
import DosenAvailability from './pages/dosen/DosenAvailability';
import CreateAvailability from './pages/dosen/CreateAvailability';
import GuidanceSessions from './pages/dosen/GuidanceSessions';
import SessionDetail from './pages/dosen/SessionDetail';
import AddNotes from './pages/dosen/AddNotes';
import StudentList from './pages/dosen/StudentList';
import StudentProgress from './pages/dosen/StudentProgress';

// Mahasiswa Pages
import MahasiswaDashboard from './pages/mahasiswa/MahasiswaDashboard';
import MahasiswaSchedule from './pages/mahasiswa/MahasiswaSchedule';
import RequestGuidance from './pages/mahasiswa/RequestGuidance';
import GuidanceHistory from './pages/mahasiswa/GuidanceHistory';
import MahasiswaSessionDetail from './pages/mahasiswa/SessionDetail';

// Shared Pages
import Profile from './pages/shared/Profile';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound.jsx';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// Auth Route (redirect if already logged in)
const AuthRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user?.role === 'DOSEN') return <Navigate to="/dosen" replace />;
    if (user?.role === 'MAHASISWA') return <Navigate to="/mahasiswa" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <ConfigProvider locale={idID} theme={{ token: { colorPrimary: '#1890ff', borderRadius: 6 } }}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<AuthRoute><AuthLayout><Login /></AuthLayout></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><AuthLayout><Register /></AuthLayout></AuthRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="users/create" element={<CreateUser />} />
              <Route path="users/:userId/edit" element={<EditUser />} />
              <Route path="import" element={<ImportData />} />
              {/* ▼▼▼ TAMBAHKAN RUTE-RUTE BERIKUT ▼▼▼ */}
              <Route path="import/schedules" element={<ImportSchedules />} />
              <Route path="import/students" element={<ImportStudents />} />
              <Route path="import/thesis-projects" element={<ImportThesisProjects />} />
              {/* ▲▲▲ ------------------------------ ▲▲▲ */}
              <Route path="monitoring" element={<MonitoringReport />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Dosen Routes */}
            <Route path="/dosen" element={<ProtectedRoute allowedRoles={['DOSEN']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<DosenDashboard />} />
              <Route path="schedule" element={<DosenSchedule />} />
              <Route path="schedule/add" element={<AddSchedule />} />
              <Route path="schedule/:id/edit" element={<AddSchedule />} />
              <Route path="availability" element={<DosenAvailability />} />
              <Route path="availability/create" element={<CreateAvailability />} />
              <Route path="availability/:id/edit" element={<CreateAvailability />} />
              <Route path="sessions" element={<GuidanceSessions />} />
              <Route path="sessions/:id" element={<SessionDetail />} />
              <Route path="sessions/:id/notes" element={<AddNotes />} />
              <Route path="students" element={<StudentList />} />
              <Route path="students/:id/progress" element={<StudentProgress />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Mahasiswa Routes */}
            <Route path="/mahasiswa" element={<ProtectedRoute allowedRoles={['MAHASISWA']}><MainLayout /></ProtectedRoute>}>
              <Route index element={<MahasiswaDashboard />} />
              <Route path="schedule" element={<MahasiswaSchedule />} />
              <Route path="request-guidance" element={<RequestGuidance />} />
              <Route path="history" element={<GuidanceHistory />} />
              <Route path="sessions/:id" element={<MahasiswaSessionDetail />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Common Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
            </Route>

            {/* Home/Landing Page - Public Access */}
            <Route path="/" element={<Dashboard />} />

            {/* Redirects & 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ConfigProvider>
  );
}

export default App;