import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import NavBar from './components/common/NavBar';
import AdminDashboard from './pages/AdminDashBoard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import PAPage from './pages/PAPage';
import BookingForm from './components/forms/BookingForm';
import TimelinePage from './pages/TimeLine';
import CalendarPage from './pages/CalendarPage';
import InstructionsPage from './pages/InstructionsPage';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected: ADMIN only */}
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Protected: PA only — booking form wrapper */}
          <Route element={<ProtectedRoute requiredRole="PA" />}>
            <Route path="/pa" element={<PAPage />} />
          </Route>

          {/* Protected: NORMAL / ADMIN users */}
          <Route element={<ProtectedRoute allowedRoles={['NORMAL', 'ADMIN']} />}>
            <Route path="/dashboard" element={<EmployeeDashboard />} />
            <Route path="/book" element={
              <div className="min-h-screen bg-white flex flex-col font-sans text-[#333333]">
                <NavBar />
                <div className="flex-1 bg-gray-100 py-10 relative overflow-y-auto">
                  <div className="container mx-auto">
                    <BookingForm />
                  </div>
                </div>
              </div>
            } />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['NORMAL', 'PA', 'ADMIN']} />}>
            <Route path="/timeline" element={<TimelinePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['NORMAL', 'PA', 'ADMIN']} />}>
            <Route path="/calendar" element={<CalendarPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['NORMAL', 'PA', 'ADMIN']} />}>
            <Route path="/instructions" element={<InstructionsPage />} />
          </Route>
          {/* Default redirect */}

          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;