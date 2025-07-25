
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // For demo purposes, we'll allow all routes
  // In a real app, you would check authentication status here
  return <>{children}</>;
};

export default ProtectedRoute;
