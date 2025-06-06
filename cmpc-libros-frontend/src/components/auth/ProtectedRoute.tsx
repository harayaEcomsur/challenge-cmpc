import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, handleAuthError } = useAuth();
  const { handleError } = useErrorHandler();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      handleAuthError();
    }
  }, [isLoading, isAuthenticated, handleAuthError]);

  if (isLoading) {
    return <div>Cargando autenticación...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;