import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import CalendarBooking from './components/CalendarBooking';
import ContactPage from './components/ContactPage';
import CoachesPage from './components/CoachesPage';
import Login from './components/Login';
import Register from './components/Register';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Profile from './components/ProfilePage';


const AppContent = () => {
    const location = useLocation();

    // Paths where the navbar should not be shown
    const hideNavbarPaths = ['/login', '/register'];

    return (
        <>
            {!hideNavbarPaths.includes(location.pathname) && <Navbar />}
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/book" element={<CalendarBooking />} />
                <Route path="/coaches" element={<CoachesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/admin-dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
