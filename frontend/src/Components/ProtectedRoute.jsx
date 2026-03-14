// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // 1. Check for the keys that define a logged-in user
  const token = localStorage.getItem('token');
  const userAuthId = localStorage.getItem('userAuthId'); // Or user._id from context

  // 2. The Gatekeeper Logic
  // If either is missing, kick them out immediately
  if (!token || !userAuthId) {
    return <Navigate to="/login" replace />;
  }

  // 3. If they pass, render the requested page (The Outlet)
  return <Outlet />;
};

export default ProtectedRoute;