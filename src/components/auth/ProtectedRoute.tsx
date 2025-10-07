import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { selectIsAuthenticated, selectAuthLoading, selectUser, loadUserFromStorage, clearAuth } from '../../store/slices/authSlice';
import { validateAuthData } from '../../lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const user = useAppSelector(selectUser);
  
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Load user from storage on mount with validation
  useEffect(() => {
    const checkAuth = async () => {
      if (!hasCheckedStorage) {
        // First, validate auth data in localStorage
        if (!validateAuthData()) {
          // Clear invalid auth state
          dispatch(clearAuth());
          setHasCheckedStorage(true);
          return;
        }
        
        await dispatch(loadUserFromStorage());
        setHasCheckedStorage(true);
      }
    };
    
    checkAuth();
  }, [dispatch, hasCheckedStorage]);

  // Show loading spinner while checking authentication
  if (!hasCheckedStorage || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Additional validation - check if we have valid user data
  const hasValidAuth = isAuthenticated && user && user.id && user.username;

  // Check if user is authenticated with valid data
  if (!hasValidAuth) {
    // Clear any invalid data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}