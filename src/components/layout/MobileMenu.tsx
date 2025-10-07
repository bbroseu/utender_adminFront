import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { logoutUser } from '../../store/slices/authSlice';
// Reusing the same menu structure from Navbar
const menuItems = [{
  id: 'panel',
  label: 'Panel',
  path: '/panel',
  hasDropdown: false
}, {
  id: 'notifications',
  label: 'Notifications',
  badge: 3,
  hasDropdown: true,
  dropdownItems: [{
    label: 'Search Tender',
    path: '/notifications/search'
  }, {
    label: 'All Tenders',
    path: '/notifications/all'
  }]
}, {
  id: 'admin',
  label: 'Admin',
  hasDropdown: true,
  dropdownItems: [{
    label: 'Add Tender',
    path: '/admin/add-tender'
  }, {
    label: 'Contracting Authorities',
    path: '/admin/authorities'
  }, {
    label: 'Search Contracting Authority',
    path: '/admin/authorities-search'
  }, {
    label: 'Countries',
    path: '/admin/countries'
  }, {
    label: 'Notification Types',
    path: '/admin/notification-types'
  }, {
    label: 'Procedures',
    path: '/admin/procedures'
  }, {
    label: 'Contract Types',
    path: '/admin/contract-types'
  }, {
    label: 'Categories',
    path: '/admin/categories'
  }, {
    label: 'Sub-Categories',
    path: '/admin/sub-categories'
  }]
}, {
  id: 'subscribers',
  label: 'Subscribers',
  hasDropdown: true,
  dropdownItems: [{
    label: 'Subscribers',
    path: '/subscribers/all'
  }, {
    label: 'Active Subscribers',
    path: '/subscribers/active'
  }, {
    label: 'Approve Subscriber',
    path: '/subscribers/approve'
  }, {
    label: 'Expired Subscribers',
    path: '/subscribers/expired'
  }, {
    label: 'Company Subscribers',
    path: '/subscribers/companies'
  }, {
    label: 'Suspended Subscribers',
    path: '/subscribers/suspended'
  }, {
    label: 'Passwords',
    path: '/subscribers/passwords'
  }, {
    label: 'Referred By',
    path: '/subscribers/referred'
  }]
}, {
  id: 'email',
  label: 'Email',
  badge: 5,
  hasDropdown: true,
  dropdownItems: [{
    label: 'Send Email · Qendrimi',
    path: '/email/send-qendrimi'
  }, {
    label: 'Send Email',
    path: '/email/send'
  }, {
    label: 'Send Weekly Email',
    path: '/email/send-weekly'
  }, {
    label: 'Send Delay Email',
    path: '/email/send-delay'
  }, {
    label: 'Send Password',
    path: '/email/send-password'
  }]
}, {
  id: 'tenders',
  label: 'Tenders',
  hasDropdown: true,
  dropdownItems: [{
    label: 'Qendrimi',
    path: '/tenders/qendrimi'
  }, {
    label: 'Blini',
    path: '/tenders/blini'
  }, {
    label: 'Tina',
    path: '/tenders/tina'
  }]
}, {
  id: 'invoices',
  label: 'Invoices',
  path: '/invoices/generate',
  hasDropdown: false
}, {
  id: 'logout',
  label: 'Log out',
  action: 'logout',
  hasDropdown: false
}];
export function MobileMenu({
  onLogout
}) {
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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
  };
  const toggleAccordion = id => {
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };
  return <div className="md:hidden bg-white border-b border-gray-200" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1">
        {menuItems.map(item => <div key={item.id} className="w-full">
            {item.hasDropdown ? <div className="w-full">
                <button onClick={() => toggleAccordion(item.id)} className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  <div className="flex items-center">
                    {item.label}
                    {item.badge && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        {item.badge}
                      </span>}
                  </div>
                  {expandedAccordion === item.id ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                </button>
                {expandedAccordion === item.id && <div className="mt-1 pl-4 border-l-2 border-gray-200 ml-3">
                    {item.dropdownItems.map((dropdownItem, idx) => <NavLink key={idx} to={dropdownItem.path} className={({
              isActive
            }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                        {dropdownItem.label}
                      </NavLink>)}
                  </div>}
              </div> : item.action === 'logout' ? <button onClick={onLogout || handleLogout} className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                {item.label}
              </button> : <NavLink to={item.path} className={({
          isActive
        }) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                {item.label}
              </NavLink>}
          </div>)}
      </div>
    </div>;
}