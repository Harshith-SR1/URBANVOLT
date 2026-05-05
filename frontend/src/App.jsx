import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import PrivateRoute from './components/PrivateRoute';
import useAuth from './hooks/useAuth';
import BottomNav from './components/BottomNav';
import NavigationPage from './pages/NavigationPage';

function App() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-dark-bg text-text-primary">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* User-facing routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/app" element={<Navigate to="/user" replace />} />
            <Route path="/user" element={<HomePage />} />
            <Route path="/user/radar" element={<HomePage />} />
            <Route path="/user/history" element={<HomePage />} />
            <Route path="/user/profile" element={<HomePage />} />
            <Route path="/user/navigation/:stationId" element={<NavigationPage />} />
          </Route>

          {/* Admin-facing routes */}
          <Route element={<PrivateRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add other admin routes here, e.g., /admin/users */}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
