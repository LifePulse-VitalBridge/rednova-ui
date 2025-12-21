import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');

  // If no token exists, kick them back to the login screen
  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  // If token exists, let them pass
  return children;
};

export default AdminProtectedRoute;