import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);
  // Map route paths to readable names
  const getReadableName = (path, index) => {
    // Special case for the first segment
    if (index === 0) {
      const specialCases = {
        panel: 'Panel',
        notifications: 'Notifications',
        admin: 'Admin',
        subscribers: 'Subscribers',
        email: 'Email',
        tenders: 'Tenders',
        invoices: 'Invoices',
        logout: 'Logout'
      };
      return specialCases[path] || path.charAt(0).toUpperCase() + path.slice(1);
    }
    // Handle hyphenated paths
    if (path.includes('-')) {
      return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
    return path.charAt(0).toUpperCase() + path.slice(1);
  };
  return <nav className="flex py-3" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link to="/panel" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <HomeIcon className="mr-1 h-4 w-4" />
            Home
          </Link>
        </li>
        {pathnames.map((path, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return <li key={path} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              {isLast ? <span className="ml-1 text-sm font-medium text-gray-800" aria-current="page">
                  {getReadableName(path, index)}
                </span> : <Link to={routeTo} className="ml-1 text-sm font-medium text-gray-500 hover:text-gray-700">
                  {getReadableName(path, index)}
                </Link>}
            </li>;
      })}
      </ol>
    </nav>;
}