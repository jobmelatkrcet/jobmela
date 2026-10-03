import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import PublicCompaniesPage from './pages/public/PublicCompaniesPage';

// Student Pages
import StudentRegisterPage from './pages/student/StudentRegisterPage';
import StudentLoginPage from './pages/student/StudentLoginPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import StudentCompaniesPage from './pages/student/StudentCompaniesPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminUnifiedPanelPage from './pages/admin/AdminUnifiedPanelPage';
import AdminCompanyStudentsPage from './pages/admin/AdminCompanyStudentsPage';
import StudentCheckInPage from './pages/student/StudentCheckInPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes with standard Layout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/companies" element={<PublicCompaniesPage />} />
            <Route path="/login" element={<StudentLoginPage />} />
            <Route path="/register" element={<StudentRegisterPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/checkin/:token" element={<StudentCheckInPage />} />
          </Route>

          {/* Student Protected Routes */}
          <Route
            element={
              <ProtectedRoute requireStudent={true}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/profile" element={<StudentProfilePage />} />
            <Route path="/my-applications" element={<StudentApplicationsPage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminUnifiedPanelPage />} />
            <Route path="/admin/dashboard" element={<AdminUnifiedPanelPage initialTab="overview" />} />
            <Route path="/admin/companies" element={<AdminUnifiedPanelPage initialTab="companies" />} />
            <Route path="/admin/rooms" element={<AdminUnifiedPanelPage initialTab="rooms" />} />
            <Route path="/admin/students" element={<AdminUnifiedPanelPage initialTab="students" />} />
            <Route path="/admin/requirements" element={<AdminUnifiedPanelPage initialTab="requirements" />} />
            <Route path="/admin/companies/:id" element={<AdminCompanyStudentsPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
