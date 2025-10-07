import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { SearchIcon, TrashIcon, EditIcon, CalendarIcon } from "lucide-react";
import sepUsersService, { SepUser } from "../../../services/sepUsersService";
import { useToast, ToastContainer } from "../../ui/Toast";

export function ExpiredSubscribers() {
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

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubscriber, setDeleteSubscriber] = useState<SepUser | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSubscriber, setEditSubscriber] = useState<SepUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // State for extend deadline modal
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendSubscriber, setExtendSubscriber] = useState<SepUser | null>(
    null
  );
  const [isExtending, setIsExtending] = useState(false);
  const [extensionDays, setExtensionDays] = useState<number>(30);

  // Load expired subscribers on component mount
  useEffect(() => {
    loadExpiredSubscribers();
  }, []);

  const loadExpiredSubscribers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      // Get expired users from /members/expired endpoint
      const data = await sepUsersService.getExpired();
      console.log("Loaded expired subscribers:", data);
      const subscribersArray = Array.isArray(data) ? data : [];
      setSubscribers(subscribersArray);
    } catch (err: any) {
      console.error("Error loading expired subscribers:", err);
      setApiError(err.message || "Failed to load expired subscribers");
      error(
        "Failed to load expired subscribers",
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
          (subscriber.contact &&
            subscriber.contact
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (subscriber.phone_number &&
            subscriber.phone_number
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (subscriber.fiscal_number &&
            subscriber.fiscal_number
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

  // Handle delete confirmation
  const handleDeleteClick = (subscriber: SepUser) => {
    setDeleteSubscriber(subscriber);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteSubscriber) return;

    try {
      setIsDeleting(true);
      await sepUsersService.delete(deleteSubscriber.id);

      success(
        "Subscriber Deleted",
        `"${
          deleteSubscriber.username || deleteSubscriber.email
        }" has been deleted successfully.`
      );

      // Refresh the subscribers list
      await loadExpiredSubscribers();

      setShowDeleteModal(false);
      setDeleteSubscriber(null);
    } catch (err: any) {
      console.error("Error deleting subscriber:", err);
      error(
        "Delete Failed",
        err.message || "Failed to delete subscriber. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle edit click
  const handleEditClick = (subscriber: SepUser) => {
    setEditSubscriber(subscriber);
    setShowEditModal(true);
  };

  // Handle edit save
  const handleEditSave = async (updatedData: Partial<SepUser>) => {
    if (!editSubscriber) return;

    try {
      setIsEditing(true);
      await sepUsersService.update(editSubscriber.id, updatedData);

      success(
        "Subscriber Updated",
        `"${
          editSubscriber.username || editSubscriber.email
        }" has been updated successfully.`
      );

      // Refresh the subscribers list
      await loadExpiredSubscribers();

      setShowEditModal(false);
      setEditSubscriber(null);
    } catch (err: any) {
      console.error("Error updating subscriber:", err);
      error(
        "Update Failed",
        err.message || "Failed to update subscriber. Please try again."
      );
    } finally {
      setIsEditing(false);
    }
  };

  // Handle extend deadline click
  const handleExtendClick = (subscriber: SepUser) => {
    setExtendSubscriber(subscriber);
    setExtensionDays(30);
    setShowExtendModal(true);
  };

  // Handle extend deadline confirmation
  const handleExtendConfirm = async () => {
    if (!extendSubscriber) return;

    try {
      setIsExtending(true);
      const newExpiryDate = new Date();
      newExpiryDate.setDate(newExpiryDate.getDate() + extensionDays);

      await sepUsersService.update(extendSubscriber.id, {
        expire_date: Math.floor(newExpiryDate.getTime() / 1000),
      });

      success(
        "Deadline Extended",
        `"${
          extendSubscriber.username || extendSubscriber.email
        }" expiry date has been extended by ${extensionDays} days.`
      );

      // Refresh the subscribers list
      await loadExpiredSubscribers();

      setShowExtendModal(false);
      setExtendSubscriber(null);
    } catch (err: any) {
      console.error("Error extending deadline:", err);
      error(
        "Extension Failed",
        err.message || "Failed to extend deadline. Please try again."
      );
    } finally {
      setIsExtending(false);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row: SepUser) => (
        <div className="font-medium text-gray-900">
          {row.name || row.username || "N/A"}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "contact",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.email || "-"}</div>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone_number",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.phone || "-"}</div>
      ),
    },
    {
      header: "Fiscal Number",
      accessor: "fiscal_number",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.fiscal_number || "-"}</div>
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
      header: "Package",
      accessor: "package",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.pako || "-"}</div>
      ),
    },
    {
      header: "Expiration Date",
      accessor: "expire_date",
      render: (row: SepUser) => (
        <div className="text-gray-900 font-medium">
          {row.valid_time_formatted
            ? row.valid_time_formatted.split("T")[0]
            : "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: SepUser) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            onClick={() => handleEditClick(row)}
            aria-label="Edit Subscriber"
            title="Edit Subscriber"
            className="text-blue-600 hover:text-blue-800"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<CalendarIcon className="h-4 w-4" />}
            onClick={() => handleExtendClick(row)}
            aria-label="Extend Deadline"
            title="Extend Deadline"
            className="text-green-600 hover:text-green-800"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDeleteClick(row)}
            aria-label="Delete Subscriber"
            title="Delete Subscriber"
            className="text-red-600 hover:text-red-800"
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
            <Button onClick={loadExpiredSubscribers} variant="primary">
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Expired Subscribers
          </h1>
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
                  placeholder="Search expired subscribers..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
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

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deleteSubscriber && (
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
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <TrashIcon
                      className="h-6 w-6 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Expired Subscriber
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete{" "}
                        {deleteSubscriber.name
                          ? `${deleteSubscriber.name} (@${deleteSubscriber.username})`
                          : deleteSubscriber.username}
                        ? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="danger"
                    className="w-full sm:col-start-2"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subscriber Modal */}
        {showEditModal && editSubscriber && (
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
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <EditIcon
                      className="h-6 w-6 text-blue-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Subscriber
                    </h3>
                    <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Username
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.username || ""}
                            id="edit-username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Email
                          </label>
                          <input
                            type="email"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.email || ""}
                            id="edit-email"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Name
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.name || ""}
                            id="edit-name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.phone_number || ""}
                            id="edit-phone"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Company
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.company || ""}
                            id="edit-company"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Fiscal Number
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.fiscal_number || ""}
                            id="edit-fiscal"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Contact
                          </label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.contact || ""}
                            id="edit-contact"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Package
                          </label>
                          <select
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={editSubscriber.package || ""}
                            id="edit-package"
                          >
                            <option value="">Select Package</option>
                            <option value="Basic">Basic</option>
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Status
                          </label>
                          <select
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={
                              editSubscriber.status?.toString() || "1"
                            }
                            id="edit-status"
                          >
                            <option value="1">Active Status</option>
                            <option value="0">Inactive Status</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 text-left">
                            Account Active
                          </label>
                          <select
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                            defaultValue={
                              editSubscriber.active?.toString() || "1"
                            }
                            id="edit-active"
                          >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 text-left">
                          Expiration Date
                        </label>
                        <input
                          type="date"
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                          defaultValue={
                            editSubscriber.expire_date
                              ? new Date(editSubscriber.expire_date * 1000)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          id="edit-expire-date"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:col-start-2"
                    onClick={() => {
                      const username = (
                        document.getElementById(
                          "edit-username"
                        ) as HTMLInputElement
                      ).value;
                      const email = (
                        document.getElementById(
                          "edit-email"
                        ) as HTMLInputElement
                      ).value;
                      const name = (
                        document.getElementById("edit-name") as HTMLInputElement
                      ).value;
                      const phone_number = (
                        document.getElementById(
                          "edit-phone"
                        ) as HTMLInputElement
                      ).value;
                      const company = (
                        document.getElementById(
                          "edit-company"
                        ) as HTMLInputElement
                      ).value;
                      const fiscal_number = (
                        document.getElementById(
                          "edit-fiscal"
                        ) as HTMLInputElement
                      ).value;
                      const contact = (
                        document.getElementById(
                          "edit-contact"
                        ) as HTMLInputElement
                      ).value;
                      const packageValue = (
                        document.getElementById(
                          "edit-package"
                        ) as HTMLSelectElement
                      ).value;
                      const status = parseInt(
                        (
                          document.getElementById(
                            "edit-status"
                          ) as HTMLSelectElement
                        ).value
                      );
                      const active = parseInt(
                        (
                          document.getElementById(
                            "edit-active"
                          ) as HTMLSelectElement
                        ).value
                      );
                      const expireDateStr = (
                        document.getElementById(
                          "edit-expire-date"
                        ) as HTMLInputElement
                      ).value;
                      const expire_date = expireDateStr
                        ? Math.floor(new Date(expireDateStr).getTime() / 1000)
                        : undefined;

                      handleEditSave({
                        username,
                        email,
                        name,
                        phone_number,
                        company,
                        fiscal_number,
                        contact,
                        package: packageValue,
                        status,
                        active,
                        expire_date,
                      });
                    }}
                    disabled={isEditing}
                  >
                    {isEditing ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Extend Deadline Modal */}
        {showExtendModal && extendSubscriber && (
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
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <CalendarIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Extend Deadline
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Extend the subscription deadline for{" "}
                        {extendSubscriber.name || extendSubscriber.username}
                      </p>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 text-left">
                        Extension Period (Days)
                      </label>
                      <select
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        value={extensionDays}
                        onChange={(e) =>
                          setExtensionDays(parseInt(e.target.value))
                        }
                      >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                        <option value={365}>1 year</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:col-start-2"
                    onClick={handleExtendConfirm}
                    disabled={isExtending}
                  >
                    {isExtending
                      ? "Extending..."
                      : `Extend by ${extensionDays} days`}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={() => setShowExtendModal(false)}
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
