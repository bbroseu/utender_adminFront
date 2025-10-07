import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { FormInput } from "../../ui/FormInput";
import {
  SearchIcon,
  FilterIcon,
  UserIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  CalendarIcon,
  TrashIcon,
} from "lucide-react";
import sepUsersService, { SepUser } from "../../../services/sepUsersService";
import { useToast, ToastContainer } from "../../ui/Toast";

export function ActiveSubscribers() {
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [subscribers, setSubscribers] = useState<SepUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // State for deadline extension modal
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [newExpiryDate, setNewExpiryDate] = useState("");
  const [isExtending, setIsExtending] = useState(false);

  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState({
    id: null,
    name: "",
    username: "",
    email: "",
    company: "",
    phone: "",
    fiscalNumber: "",
    contact: "",
    status: "active",
    expiryDate: "",
    registrationDate: "",
    package: "",
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubscriber, setDeleteSubscriber] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load subscribers on component mount
  useEffect(() => {
    loadActiveSubscribers();
  }, []);

  const loadActiveSubscribers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await sepUsersService.getActive();
      console.log("Loaded active subscribers:", data);
      // Data should already be filtered to active subscribers from the API
      const activeSubscribers = Array.isArray(data) ? data : [];
      setSubscribers(activeSubscribers);
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

  // Handle extend deadline
  const handleExtendDeadline = (subscriber: SepUser) => {
    setSelectedSubscriber(subscriber);
    // Convert timestamp to date string for date input
    const currentExpiry = subscriber.expire_date
      ? new Date(subscriber.expire_date * 1000).toISOString().split("T")[0]
      : "";
    setNewExpiryDate(currentExpiry);
    setShowExtendModal(true);
  };

  // Handle deadline extension submission
  const handleExtendSubmit = async () => {
    if (!newExpiryDate || !selectedSubscriber) return;

    try {
      setIsExtending(true);

      // Calculate additional days from current expiry date
      let currentExpiryDate;
      if (selectedSubscriber.expire_date) {
        currentExpiryDate = new Date(selectedSubscriber.expire_date * 1000);
      } else {
        // If no current expiry date, use today as the starting point
        currentExpiryDate = new Date();
      }

      const newExpiryDateTime = new Date(newExpiryDate);
      const additionalDays = Math.ceil(
        (newExpiryDateTime.getTime() - currentExpiryDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

      console.log("Current expiry date:", currentExpiryDate);
      console.log("New expiry date:", newExpiryDateTime);
      console.log("Additional days calculated:", additionalDays);

      if (additionalDays <= 0) {
        error(
          "Invalid Date",
          "New expiry date must be after the current expiry date."
        );
        return;
      }

      await sepUsersService.extendExpiry(selectedSubscriber.id, additionalDays);

      success(
        "Deadline Extended",
        `Expiry date updated successfully for ${
          selectedSubscriber.username || selectedSubscriber.email
        }`
      );

      // Refresh the subscribers list
      await loadActiveSubscribers();

      setShowExtendModal(false);
      setSelectedSubscriber(null);
      setNewExpiryDate("");
    } catch (err: any) {
      console.error("Error extending deadline:", err);
      error("Failed to extend deadline", err.message || "Please try again.");
    } finally {
      setIsExtending(false);
    }
  };

  // Handle edit subscriber
  const handleEdit = (subscriber: SepUser) => {
    setEditingSubscriber({
      id: subscriber.id,
      name: subscriber.name || subscriber.username || "",
      email: subscriber.email || "",
      company: subscriber.company || "",
      phone: subscriber.phone_number || "",
      fiscalNumber: subscriber.fiscal_number || "",
      status: subscriber.active === 1 ? "active" : "inactive",
      expiryDate: subscriber.expire_date
        ? new Date(subscriber.expire_date * 1000).toISOString().split("T")[0]
        : "",
      registrationDate: subscriber.register_date
        ? new Date(subscriber.register_date * 1000).toISOString().split("T")[0]
        : "",
      package: subscriber.package || "",
      contact: subscriber.contact || "",
      username: subscriber.username || "",
    });
    setShowEditModal(true);
  };

  // Handle edit input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingSubscriber({
      ...editingSubscriber,
      [name]: value,
    });
    // Clear error for this field
    if (editErrors[name]) {
      setEditErrors({
        ...editErrors,
        [name]: null,
      });
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    const newErrors = {};
    if (!editingSubscriber.username || !editingSubscriber.username.trim()) {
      newErrors.username = "Username is required";
    }
    if (!editingSubscriber.name || !editingSubscriber.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!editingSubscriber.email || !editingSubscriber.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editingSubscriber.email)) {
      newErrors.email = "Email is invalid";
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!validateEditForm()) return;

    try {
      setIsUpdating(true);

      // Prepare data for backend (SepUsers model format)
      const updateData: Partial<SepUser> = {
        id: editingSubscriber.id,
        username: editingSubscriber.username
          ? editingSubscriber.username.trim()
          : editingSubscriber.name.trim(),
        email: editingSubscriber.email.trim().toLowerCase(),
        active: editingSubscriber.status === "active" ? 1 : 0,
      };

      // Add new fields to updateData based on editingSubscriber (always include, even if empty)
      updateData.name = editingSubscriber.name
        ? editingSubscriber.name.trim()
        : "";
      updateData.phone_number = editingSubscriber.phone
        ? editingSubscriber.phone.trim()
        : "";
      updateData.company = editingSubscriber.company
        ? editingSubscriber.company.trim()
        : "";
      updateData.fiscal_number = editingSubscriber.fiscalNumber
        ? editingSubscriber.fiscalNumber.trim()
        : "";
      updateData.contact = editingSubscriber.contact
        ? editingSubscriber.contact.trim()
        : "";
      updateData.package = editingSubscriber.package
        ? editingSubscriber.package.trim()
        : "";

      // Add expiry date if provided
      if (editingSubscriber.expiryDate) {
        updateData.expire_date = Math.floor(
          new Date(editingSubscriber.expiryDate).getTime() / 1000
        );
      }

      await sepUsersService.update(updateData.id, updateData);

      success(
        "Subscriber Updated",
        `"${editingSubscriber.name}" has been updated successfully.`
      );

      // Refresh the subscribers list
      await loadActiveSubscribers();

      setShowEditModal(false);
      setEditingSubscriber({
        id: null,
        name: "",
        email: "",
        company: "",
        phone: "",
        fiscalNumber: "",
        status: "pending",
        expiryDate: "",
        registrationDate: "",
        package: "",
        contact: "",
        username: "",
      });
      setEditErrors({});
    } catch (err: any) {
      console.error("Error updating subscriber:", err);
      error(
        "Update Failed",
        err.message || "Failed to update subscriber. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (subscriber) => {
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
      await loadActiveSubscribers();

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

  const columns = [
    {
      header: "ID",
      accessor: "id",
      render: (row: SepUser) => (
        <div className="font-medium text-gray-900">{row.id}</div>
      ),
    },
    {
      header: "Name / Username",
      accessor: "name",
      render: (row: SepUser) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.full_name !== "N/A"
              ? row.full_name
              : row.first_name && row.last_name
              ? `${row.first_name} ${row.last_name}`
              : row.username}
          </div>
          <div className="text-xs text-gray-500">@{row.username}</div>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      render: (row: SepUser) => (
        <div>
          <span className="text-sm text-gray-900">{row.email}</span>
          {row.sec_email && (
            <div className="text-xs text-gray-500">{row.sec_email}</div>
          )}
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: "phone",
      render: (row: SepUser) => (
        <span className="text-sm text-gray-900">{row.phone || "-"}</span>
      ),
    },
    {
      header: "Company",
      accessor: "company",
      render: (row: SepUser) => (
        <span className="text-sm text-gray-900">{row.company || "-"}</span>
      ),
    },
    {
      header: "Fiscal Number",
      accessor: "fiscal_number",
      render: (row: SepUser) => (
        <span className="text-sm text-gray-900">
          {row.fiscal_number || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row: SepUser) => (
        <div>
          <Badge variant={row.status === 1 ? "success" : "error"}>
            {row.status_text || (row.status === 1 ? "Active" : "Inactive")}
          </Badge>
          {row.days_until_expiry !== null && row.days_until_expiry <= 30 && (
            <div className="text-xs text-orange-500 mt-1">
              {row.days_until_expiry > 0
                ? `${row.days_until_expiry} days left`
                : "Expired"}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Created",
      accessor: "create_date",
      render: (row: SepUser) => (
        <div className="text-sm text-gray-900">
          {row.create_date_formatted
            ? new Date(row.create_date_formatted).toLocaleDateString()
            : row.create_date
            ? new Date(row.create_date * 1000).toLocaleDateString()
            : "-"}
        </div>
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
      header: <div className="text-right">Actions</div>,
      accessor: "actions",
      render: (row: SepUser) => (
        <div className="flex space-x-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            aria-label="Edit"
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEdit(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<CalendarIcon className="h-4 w-4" />}
            aria-label="Extend Deadline"
            className="text-green-600 hover:text-green-800"
            onClick={() => handleExtendDeadline(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            aria-label="Delete"
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteClick(row)}
          />
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Active Subscribers
          </h1>
          {/* No Add button - as requested */}
        </div>
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
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
                  className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
                  transition-colors duration-200
                  border-input focus:border-primary focus:ring-primary/30
                  focus:ring-2 focus:outline-none
                  text-foreground placeholder:text-muted-foreground text-sm"
                  placeholder="Search subscribers..."
                />
              </div>
            </div>
          </div>
          <Table columns={columns} data={subscribers} />
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button variant="secondary" size="sm">
                Previous
              </Button>
              <Button variant="secondary" size="sm">
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">1-{subscribers.length}</span> of{" "}
                  <span className="font-medium">{subscribers.length}</span>
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <Button
                    variant="ghost"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                  </Button>
                  <Button
                    variant="primary"
                    className="relative inline-flex items-center px-2 py-1 border border-blue-500 text-xs font-medium"
                  >
                    1
                  </Button>
                  <Button
                    variant="ghost"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
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
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Extend Deadline Modal */}
        {showExtendModal && selectedSubscriber && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowExtendModal(false)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <CalendarIcon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Extend Deadline
                      </h3>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Extending deadline for:
                        </p>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="font-medium text-gray-900">
                            {selectedSubscriber.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedSubscriber.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedSubscriber.company}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Current expiry date:{" "}
                          {selectedSubscriber.expiryDate
                            ? new Date(
                                selectedSubscriber.expiryDate
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                      </div>
                      <FormInput
                        id="newExpiryDate"
                        label="New Expiry Date"
                        type="date"
                        required
                        value={newExpiryDate}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:w-auto sm:ml-3"
                    onClick={handleExtendSubmit}
                    disabled={isExtending || !newExpiryDate}
                    icon={<CalendarIcon className="h-4 w-4" />}
                  >
                    {isExtending ? "Extending..." : "Extend Deadline"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:w-auto sm:mt-0"
                    onClick={() => setShowExtendModal(false)}
                    disabled={isExtending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Subscriber Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowEditModal(false)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Subscriber
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="username"
                            label="Username"
                            required
                            value={editingSubscriber.username}
                            onChange={handleEditInputChange}
                            error={editErrors.username}
                            helpText="Login username"
                          />
                          <FormInput
                            id="name"
                            label="Full Name"
                            required
                            value={editingSubscriber.name}
                            onChange={handleEditInputChange}
                            error={editErrors.name}
                          />
                        </div>
                        <FormInput
                          id="email"
                          label="Email Address"
                          type="email"
                          required
                          value={editingSubscriber.email}
                          onChange={handleEditInputChange}
                          error={editErrors.email}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="phone"
                            label="Phone Number"
                            value={editingSubscriber.phone}
                            onChange={handleEditInputChange}
                            error={editErrors.phone}
                          />
                          <FormInput
                            id="company"
                            label="Company"
                            value={editingSubscriber.company}
                            onChange={handleEditInputChange}
                            error={editErrors.company}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="fiscalNumber"
                            label="Fiscal Number"
                            value={editingSubscriber.fiscalNumber}
                            onChange={handleEditInputChange}
                            error={editErrors.fiscalNumber}
                          />
                          <FormInput
                            id="contact"
                            label="Contact"
                            value={editingSubscriber.contact}
                            onChange={handleEditInputChange}
                            error={editErrors.contact}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="package"
                            label="Package"
                            value={editingSubscriber.package}
                            onChange={handleEditInputChange}
                            error={editErrors.package}
                          />
                          <div>
                            <label
                              htmlFor="status"
                              className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                              Account Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              className="block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm
                              transition-colors duration-200
                              border-input focus:border-primary focus:ring-primary/30
                              focus:ring-2 focus:outline-none
                              text-foreground placeholder:text-muted-foreground text-sm"
                              value={editingSubscriber.status}
                              onChange={handleEditInputChange}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            id="registrationDate"
                            label="Registration Date"
                            type="date"
                            value={editingSubscriber.registrationDate}
                            onChange={handleEditInputChange}
                            disabled
                            helpText="Registration date cannot be changed"
                          />
                          <FormInput
                            id="expiryDate"
                            label="Expiry Date"
                            type="date"
                            value={editingSubscriber.expiryDate}
                            onChange={handleEditInputChange}
                            helpText="Leave empty for no expiry limit"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:w-auto sm:ml-3"
                    onClick={handleEditSubmit}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update Subscriber"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:w-auto sm:mt-0"
                    onClick={() => setShowEditModal(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                      Delete Subscriber
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
      </div>
    </>
  );
}
