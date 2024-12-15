import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
    const role = localStorage.getItem('role'); // Retrieve role from localStorage

    // If the user is not an admin, redirect them to the home page or login
    if (role !== 'admin') {
        return <Navigate to="/" />;
    }

    // If the user is an admin, render the protected component
    return children;
};

export default AdminRoute;
