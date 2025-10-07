import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';

export function LogoutPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if there's an error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    };

    // Add a small delay to show the logout message
    const timeoutId = setTimeout(performLogout, 1000);
    return () => clearTimeout(timeoutId);
  }, [navigate, dispatch]);
  return <div className="flex flex-col items-center justify-center h-64">
      <LogOutIcon className="h-16 w-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-medium text-gray-900 mb-2">Logging out...</h2>
      <p className="text-gray-500">
        Please wait while we log you out of the system.
      </p>
    </div>;
}