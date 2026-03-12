import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import PlanHistory from './pages/PlanHistory';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Exercises from './pages/Exercises';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Admin from './pages/Admin';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin') === '1';
  if (!token) return null;

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  return (
    <header className="app-header">
      <NavLink to="/dashboard" className="app-logo">AdaptiveFit</NavLink>
      <nav className="app-nav">
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Dashboard</NavLink>
        <NavLink to="/exercises" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Exercises</NavLink>
        <NavLink to="/checkin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Check-In</NavLink>
        <NavLink to="/history" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>History</NavLink>
        <NavLink to="/progress" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Progress</NavLink>
        <NavLink to="/profile" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Profile</NavLink>
        {isAdmin && (
          <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} style={{ color: 'var(--accent)' }}>Admin</NavLink>
        )}
        <button className="nav-link" onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/checkin" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><PlanHistory /></PrivateRoute>} />
            <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/exercises" element={<PrivateRoute><Exercises /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
