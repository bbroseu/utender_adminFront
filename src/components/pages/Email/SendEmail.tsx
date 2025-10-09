import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import {
  SearchIcon,
  MailIcon,
  SendIcon,
  UsersIcon,
  CheckIcon,
  AlertCircleIcon,
} from "lucide-react";
import sepUsersService, { SepUser } from "../../../services/sepUsersService";
import { useToast, ToastContainer } from "../../ui/Toast";
import { AppDispatch } from "../../../store";
import {
  sendEmailToMember,
  selectEmailSending,
  selectEmailError,
  selectLastSentEmail,
  clearError,
  clearLastSentEmail,
} from "../../../store/slices/emailSlice";


export function SendEmail() {
  const dispatch = useDispatch<AppDispatch>();
  const isSendingEmail = useSelector(selectEmailSending);
  const emailError = useSelector(selectEmailError);
  const lastSentEmail = useSelector(selectLastSentEmail);
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [subscribers, setSubscribers] = useState<SepUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Email modal state (removed - no longer needed)

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationUser, setConfirmationUser] = useState<SepUser | null>(
    null
  );

  // Load active subscribers on component mount
  useEffect(() => {
    loadActiveSubscribers();
  }, []);

  // Handle email errors and success from Redux
  useEffect(() => {
    if (emailError) {
      error("Failed to Send Email", emailError);
      dispatch(clearError());
    }
  }, [emailError, error, dispatch]);

  useEffect(() => {
    if (lastSentEmail && lastSentEmail.success) {
      success(
        "Email Sent Successfully!",
        `Email sent to ${lastSentEmail.recipientCount} recipient${
          lastSentEmail.recipientCount > 1 ? "s" : ""
        }`
      );
      dispatch(clearLastSentEmail());
    }
  }, [lastSentEmail, success, dispatch]);

  const loadActiveSubscribers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await sepUsersService.getActive();
      const subscribersArray = Array.isArray(data) ? data : [];
      setSubscribers(subscribersArray);
    } catch (err: any) {
      console.error("Error loading active subscribers:", err);
      setApiError(err.message || "Failed to load active subscribers");
      error(
        "Failed to load active subscribers",
        err.message || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter subscribers based on search query
  const filteredSubscribers = Array.isArray(subscribers)
    ? subscribers.filter((subscriber) => {
        return (
          searchQuery === "" ||
          (subscriber.name &&
            subscriber.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (subscriber.email &&
            subscriber.email
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (subscriber.company &&
            subscriber.company
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (subscriber.username &&
            subscriber.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        );
      })
    : [];

  // Update total items when filtered subscribers change
  React.useEffect(() => {
    setTotalItems(filteredSubscribers.length);
    setCurrentPage(1); // Reset to first page when search changes
  }, [filteredSubscribers.length, searchQuery]);

  // Paginate the filtered subscribers
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle email sending directly

  // Handle confirmation dialog
  const handleSendToAllUsersClick = () => {
    setConfirmationUser(null);
    setShowConfirmation(true);
  };

  const handleSendToUserClick = (user: SepUser) => {
    setConfirmationUser(user);
    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    
    try {
      if (confirmationUser) {
        // Send to specific user
        await dispatch(
          sendEmailToMember({
            memberId: confirmationUser.id,
          })
        ).unwrap();
      } else {
        // Send to all active users - for now we'll just show an error since the API endpoint is specific to one user
        error("Feature Not Available", "Sending to all users is not supported with this endpoint");
      }
    } catch (err: any) {
      // Error handling is done in useEffect
      console.error("Error sending email:", err);
    }
    
    setConfirmationUser(null);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
    setConfirmationUser(null);
  };

  // Email handling removed - sending happens directly from confirmation

  const columns = [
    {
      header: "Name & Lastname",
      accessor: "name",
      render: (row: SepUser) => (
        <div className="font-medium text-gray-900">
          {row.name || row.username || "N/A"}
        </div>
      ),
    },
    {
      header: "Company",
      accessor: "company",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.company || "-"}</div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.email}</div>
      ),
    },
    {
      header: "Expiration Date",
      accessor: "expire_date",
      render: (row: SepUser) => {
        <div className="text-gray-900">{row.valid_time_formatted}</div>;
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: SepUser) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            icon={<SendIcon className="h-4 w-4" />}
            onClick={() => handleSendToUserClick(row)}
            aria-label="Send Email"
            title="Send Email"
            className="text-blue-600 hover:text-blue-800"
          />
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{apiError}</div>
            <Button onClick={loadActiveSubscribers} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <MailIcon className="h-6 w-6 mr-2 text-blue-600" />
              Send Email
            </h1>
            <p className="text-gray-600 mt-1">
              Send emails to active subscribers
            </p>
          </div>
          <Button
            variant="primary"
            icon={<UsersIcon className="h-4 w-4" />}
            onClick={handleSendToAllUsersClick}
            className="bg-green-600 hover:bg-green-700"
          >
            Send to All Users
          </Button>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search active subscribers..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{totalItems}</span> active
                subscribers
              </div>
            </div>
          </div>
          <Table columns={columns} data={paginatedSubscribers} />

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">
                      {startIndex + 1}-{Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-2 py-1 border text-xs font-medium ${
                            pageNumber === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <AlertCircleIcon
                      className="h-6 w-6 text-yellow-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {confirmationUser
                        ? "Send Email to User"
                        : "Send Email to All Users"}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {confirmationUser ? (
                          <>
                            Are you sure you want to send an email to{" "}
                            <strong>
                              {confirmationUser.name ||
                                confirmationUser.username}
                            </strong>{" "}
                            ({confirmationUser.email})?
                          </>
                        ) : (
                          <>
                            Sending to all users is not supported with the current API endpoint. Please select individual users instead.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:col-start-2 bg-yellow-600 hover:bg-yellow-700"
                    onClick={handleConfirmSend}
                    disabled={!confirmationUser || isSendingEmail}
                  >
                    {isSendingEmail ? "Sending..." : "Yes, Continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={handleCancelConfirmation}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
