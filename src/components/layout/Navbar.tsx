import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BellIcon,
  UserIcon,
  UsersIcon,
  MailIcon,
  FileTextIcon,
  LogOutIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useAppDispatch } from "../../hooks/redux";
import { logoutUser } from "../../store/slices/authSlice";
// Dropdown menu data structure
const menuItems = [
  {
    id: "panel",
    label: "Panel",
    icon: <UserIcon className="h-5 w-5 mr-2" />,
    path: "/panel",
    hasDropdown: false,
  },
  {
    id: "notifications",
    label: "Tender Categories",
    icon: <BellIcon className="h-5 w-5 mr-2" />,
    // badge: 3,
    hasDropdown: true,
    dropdownItems: [
      {
        label: "Search Tender",
        path: "/notifications/search",
      },
      {
        label: "All Tenders",
        path: "/notifications/all",
      },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    icon: <UserIcon className="h-5 w-5 mr-2" />,
    hasDropdown: true,
    dropdownItems: [
      {
        label: "Add Tender",
        path: "/admin/add-tender",
      },
      {
        label: "Contracting Authorities",
        path: "/admin/authorities",
      },
      {
        label: "Search Contracting Authority",
        path: "/admin/authorities-search",
      },
      {
        label: "Countries",
        path: "/admin/countries",
      },
      {
        label: "Notification Types",
        path: "/admin/notification-types",
      },
      {
        label: "Procedures",
        path: "/admin/procedures",
      },
      {
        label: "Contract Types",
        path: "/admin/contract-types",
      },
      {
        label: "Categories",
        path: "/admin/categories",
      },
      // {
      //   label: "Sub-Categories",
      //   path: "/admin/sub-categories",
      // },
    ],
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: <UsersIcon className="h-5 w-5 mr-2" />,
    hasDropdown: true,
    dropdownItems: [
      {
        label: "Subscribers",
        path: "/subscribers/all",
      },
      {
        label: "Active Subscribers",
        path: "/subscribers/active",
      },
      {
        label: "Approve Subscriber",
        path: "/subscribers/approve",
      },
      {
        label: "Expired Subscribers",
        path: "/subscribers/expired",
      },
      {
        label: "Company Subscribers",
        path: "/subscribers/companies",
      },
      {
        label: "Suspended Subscribers",
        path: "/subscribers/suspended",
      },
      // {
      //   label: "Passwords",
      //   path: "/subscribers/passwords",
      // },
      // {
      //   label: "Referred By",
      //   path: "/subscribers/referred",
      // },
    ],
  },
  {
    id: "email",
    label: "Email",
    icon: <MailIcon className="h-5 w-5 mr-2" />,
    // badge: 5,
    hasDropdown: true,
    dropdownItems: [
      // {
      //   label: "Send Email · Qendrimi",
      //   path: "/email/send-qendrimi",
      // },
      {
        label: "Send Email",
        path: "/email/send",
      },
      // {
      //   label: "Send Weekly Email",
      //   path: "/email/send-weekly",
      // },
      // {
      //   label: "Send Delay Email",
      //   path: "/email/send-delay",
      // },
      {
        label: "Send Password",
        path: "/email/send-password",
      },
    ],
  },
  {
    id: "tenders",
    label: "Tenders",
    icon: <FileTextIcon className="h-5 w-5 mr-2" />,
    hasDropdown: true,
    dropdownItems: [
      {
        label: "Qendrimi",
        path: "/tenders/qendrim",
      },
      {
        label: "Blini",
        path: "/tenders/blini",
      },
      {
        label: "Tina",
        path: "/tenders/tina",
      },
    ],
  },
  {
    id: "invoices",
    label: "Invoices",
    icon: <div className="h-5 w-5 mr-2" />,
    path: "/invoices/generate",
    hasDropdown: false,
  },
  {
    id: "logout",
    label: "Log out",
    icon: <LogOutIcon className="h-5 w-5 mr-2" />,
    action: "logout",
    hasDropdown: false,
  },
];
export function Navbar({ onLogout }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dropdownRefs = useRef({});

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login", { replace: true });
    }
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        openDropdown &&
        dropdownRefs.current[openDropdown] &&
        !dropdownRefs.current[openDropdown].contains(event.target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);
  // Close dropdown when route changes
  useEffect(() => {
    setOpenDropdown(null);
  }, [location]);
  // Handle keyboard navigation
  const handleKeyDown = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown(id);
    } else if (e.key === "Escape" && openDropdown === id) {
      setOpenDropdown(null);
    }
  };
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };
  const isActive = (path) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };
  const isDropdownActive = (items) => {
    return items.some((item) => isActive(item.path));
  };
  return (
    <nav className="flex space-x-1">
      {menuItems.map((item) => (
        <div
          key={item.id}
          ref={(el) => (dropdownRefs.current[item.id] = el)}
          className="relative"
        >
          {item.hasDropdown ? (
            <div>
              <button
                onClick={() => toggleDropdown(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDropdownActive(item.dropdownItems) ||
                  openDropdown === item.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                aria-expanded={openDropdown === item.id}
                tabIndex={0}
              >
                {item.icon}
                {item.label}
                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
                <ChevronDownIcon
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    openDropdown === item.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {/* Dropdown Menu */}
              {openDropdown === item.id && (
                <div
                  className="absolute z-10 left-0 mt-2 w-56 origin-top-left rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby={`${item.id}-menu-button`}
                >
                  <div className="py-1" role="none">
                    {item.dropdownItems.map((dropdownItem, idx) => (
                      <NavLink
                        key={idx}
                        to={dropdownItem.path}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm ${
                            isActive
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`
                        }
                        role="menuitem"
                      >
                        {dropdownItem.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : item.action === "logout" ? (
            <button
              onClick={onLogout || handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {item.icon}
              {item.label}
            </button>
          ) : (
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          )}
        </div>
      ))}
    </nav>
  );
}
