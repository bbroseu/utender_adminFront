import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, SearchIcon, BellIcon, MailIcon, LogOutIcon } from 'lucide-react';
import { Navbar } from './Navbar';
import { MobileMenu } from './MobileMenu';
import { Button } from '../ui/Button';
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
export function Header({
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
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
    setShowLogoutModal(false);
  };
  return <>
      <header className="sticky top-0 z-30 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/panel" className="text-lg font-semibold text-foreground flex items-center">
                <span className="text-primary mr-1.5">u</span>Tender
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <Navbar onLogout={() => setShowLogoutModal(true)} />
            </div>
            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <Button variant="ghost" size="sm" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                <span className="sr-only">
                  {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                </span>
                {isMobileMenuOpen ? <XIcon className="block h-6 w-6" aria-hidden="true" /> : <MenuIcon className="block h-6 w-6" aria-hidden="true" />}
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && <MobileMenu onLogout={() => setShowLogoutModal(true)} />}
      </header>
      {/* Logout Modal */}
      {showLogoutModal && <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-card rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-4">
                <LogOutIcon className="h-6 w-6 text-destructive" aria-hidden="true" />
              </div>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Confirm Logout
                </h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to log out of the admin panel?
                </p>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleLogout}>
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>}
    </>;
}