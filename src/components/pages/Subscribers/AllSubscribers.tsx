import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { FormInput } from "../../ui/FormInput";
import { SearchableDropdown } from "../../ui/SearchableDropdown";
import {
  SearchIcon,
  FilterIcon,
  UserIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  PlusIcon,
  CalendarIcon,
  TrashIcon,
  PackageIcon,
} from "lucide-react";
import subscribersService, {
  Subscriber,
  SubscriberCreateData,
  SubscriberUpdateData,
} from "../../../services/subscribersService";
import { useToast, ToastContainer } from "../../ui/Toast";

interface PackageOption {
  value: string;
  label: string;
  duration: string;
}

export function AllSubscribers() {
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  // State for Add Subscriber modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSubscriber, setNewSubscriber] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    company: "",
    fiscalNumber: "",
    contact: "",
    package: "",
    status: "pending",
    expiryDate: "",
    registrationDate: new Date().toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Package options
  const [packages] = useState<PackageOption[]>([
    {
      value: "1_month",
      label: "1 Month Package",
      duration: "30 days",
    },
    {
      value: "3_months",
      label: "3 Months Package",
      duration: "90 days",
    },
    {
      value: "6_months",
      label: "6 Months Package",
      duration: "180 days",
    },
    {
      value: "12_months",
      label: "12 Months Package",
      duration: "365 days",
    },
  ]);

  // Load subscribers on component mount
  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await subscribersService.getAll();
      console.log("Loaded subscribers:", data);
      setSubscribers(data);
    } catch (err: any) {
      console.error("Error loading subscribers:", err);
      setApiError(err.message || "Failed to load subscribers");
      error(
        "Failed to load subscribers",
        err.message || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };
  // Handle extend deadline
  const handleExtendDeadline = (subscriber: Subscriber) => {
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
      await subscribersService.extendExpiry(
        selectedSubscriber.id,
        newExpiryDate
      );

      success(
        "Deadline Extended",
        `Expiry date updated successfully for ${
          selectedSubscriber.username || selectedSubscriber.email
        }`
      );

      // Refresh the subscribers list
      await loadSubscribers();

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
  const handleEdit = (subscriber: Subscriber) => {
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

  // Handle package selection for edit subscriber
  const handleEditPackageSelect = (packageValue: string | number) => {
    setEditingSubscriber((prev) => ({
      ...prev,
      package: String(packageValue),
    }));
    // Clear package error if exists
    if (editErrors.package) {
      setEditErrors({
        ...editErrors,
        package: null,
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
      const updateData: SubscriberUpdateData = {
        id: editingSubscriber.id,
        username: editingSubscriber.name.trim(),
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

      await subscribersService.update(updateData);

      success(
        "Subscriber Updated",
        `"${editingSubscriber.name}" has been updated successfully.`
      );

      // Refresh the subscribers list
      await loadSubscribers();

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
      await subscribersService.delete(deleteSubscriber.id);

      success(
        "Subscriber Deleted",
        `"${
          deleteSubscriber.username || deleteSubscriber.email
        }" has been deleted successfully.`
      );

      // Refresh the subscribers list
      await loadSubscribers();

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
      header: "Name",
      accessor: "name",
      render: (row: Subscriber) => (
        <div className="font-medium text-gray-900">
          {row.name || row.username || "N/A"}
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "contact",
      render: (row: Subscriber) => (
        <span className="text-sm text-gray-900">{row.email || "-"}</span>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone_number",
      render: (row: Subscriber) => (
        <span className="text-sm text-gray-900">{row.phone || "-"}</span>
      ),
    },
    {
      header: "Company",
      accessor: "company",
      render: (row: Subscriber) => (
        <span className="text-sm text-gray-900">{row.company || "-"}</span>
      ),
    },
    {
      header: "Fiscal Number",
      accessor: "fiscal_number",
      render: (row: Subscriber) => (
        <span className="text-sm text-gray-900">
          {row.fiscal_number || "-"}
        </span>
      ),
    },

    {
      header: "Expiration Date",
      accessor: "expire_date",
      render: (row: Subscriber) => (
        <div className="text-gray-900 font-medium">
          {row.valid_time_formatted
            ? row.valid_time_formatted.split("T")[0]
            : "-"}
        </div>
      ),
    },
    {
      header: "Package",
      accessor: "package",
      render: (row: Subscriber) => (
        <span className="text-sm text-gray-900">{row.pako || "-"}</span>
      ),
    },
    {
      header: <div className="text-right">Actions</div>,
      accessor: "actions",
      render: (row) => (
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
  // Handle input change for new subscriber form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSubscriber({
      ...newSubscriber,
      [name]: value,
    });
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  // Handle package selection for new subscriber
  const handlePackageSelect = (packageValue: string | number) => {
    setNewSubscriber((prev) => ({
      ...prev,
      package: String(packageValue),
    }));
    // Clear package error if exists
    if (errors.package) {
      setErrors({
        ...errors,
        package: null,
      });
    }
  };
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!newSubscriber.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!newSubscriber.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newSubscriber.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!newSubscriber.registrationDate) {
      newErrors.registrationDate = "Registration date is required";
    }
    // Only validate expiry date if status is not pending
    if (newSubscriber.status !== "pending" && !newSubscriber.expiryDate) {
      newErrors.expiryDate = "Expiry date is required for this status";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Prepare data for backend (SepUsers model format)
      const createData: SubscriberCreateData = {
        name: newSubscriber.name.trim(),
        username: newSubscriber.name.trim().toLowerCase().replace(/\s+/g, ""), // Generate username from name
        email: newSubscriber.email.trim().toLowerCase(),
        password: "defaultPassword123", // You may want to generate a random password or ask for it
        active: newSubscriber.status === "active" ? 1 : 0,
        status: 1,
        register_date: Math.floor(
          new Date(newSubscriber.registrationDate).getTime() / 1000
        ),
      };

      // Add optional fields (send empty string if not provided)
      createData.phone_number = newSubscriber.phone
        ? newSubscriber.phone.trim()
        : "";
      createData.company = newSubscriber.company
        ? newSubscriber.company.trim()
        : "";
      createData.fiscal_number = newSubscriber.fiscalNumber
        ? newSubscriber.fiscalNumber.trim()
        : "";
      createData.contact = newSubscriber.contact
        ? newSubscriber.contact.trim()
        : "";
      createData.package = newSubscriber.package
        ? newSubscriber.package.trim()
        : "";

      // Add expiry date if provided
      if (newSubscriber.expiryDate) {
        createData.expire_date = Math.floor(
          new Date(newSubscriber.expiryDate).getTime() / 1000
        );
      }

      await subscribersService.create(createData);

      success(
        "Subscriber Created",
        `"${newSubscriber.name}" has been created successfully.`
      );

      // Refresh the subscribers list
      await loadSubscribers();

      setShowAddModal(false);
      // Reset form
      setNewSubscriber({
        name: "",
        username: "",
        email: "",
        phone: "",
        company: "",
        fiscalNumber: "",
        contact: "",
        package: "",
        status: "pending",
        expiryDate: "",
        registrationDate: new Date().toISOString().split("T")[0],
      });
      setErrors({});
    } catch (err: any) {
      console.error("Error creating subscriber:", err);
      error(
        "Creation Failed",
        err.message || "Failed to create subscriber. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
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
            <Button onClick={loadSubscribers} variant="primary">
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
                  <span className="font-medium">1-5</span> of{" "}
                  <span className="font-medium">25</span>
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
                    className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    2
                  </Button>
                  <Button
                    variant="ghost"
                    className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    3
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

        {/* Add Subscriber Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
                onClick={() => setShowAddModal(false)}
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Add New Subscriber
                      </h3>
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                          <FormInput
                            id="name"
                            label="Full Name"
                            required
                            value={newSubscriber.name}
                            onChange={handleInputChange}
                            error={errors.name}
                          />
                          <FormInput
                            id="email"
                            label="Email Address"
                            type="email"
                            required
                            value={newSubscriber.email}
                            onChange={handleInputChange}
                            error={errors.email}
                          />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                              id="phone"
                              label="Phone Number"
                              value={newSubscriber.phone}
                              onChange={handleInputChange}
                              error={errors.phone}
                            />
                            <FormInput
                              id="company"
                              label="Company"
                              value={newSubscriber.company}
                              onChange={handleInputChange}
                              error={errors.company}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                              id="fiscalNumber"
                              label="Fiscal Number"
                              value={newSubscriber.fiscalNumber}
                              onChange={handleInputChange}
                              error={errors.fiscalNumber}
                            />
                            <FormInput
                              id="contact"
                              label="Contact"
                              value={newSubscriber.contact}
                              onChange={handleInputChange}
                              error={errors.contact}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableDropdown
                              label="Package"
                              options={packages.map((pkg) => ({
                                value: pkg.value,
                                label: pkg.label,
                              }))}
                              value={newSubscriber.package}
                              onChange={handlePackageSelect}
                              placeholder="Select a package..."
                              searchPlaceholder="Search packages..."
                              helpText="Choose subscription package duration"
                              icon={
                                <PackageIcon className="h-4 w-4 text-blue-600" />
                              }
                              error={errors.package}
                            />
                            <div>
                              <label
                                htmlFor="status"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                              >
                                Status
                              </label>
                              <select
                                id="status"
                                name="status"
                                className="block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm
                                transition-colors duration-200
                                border-input focus:border-primary focus:ring-primary/30
                                focus:ring-2 focus:outline-none
                                text-foreground placeholder:text-muted-foreground text-sm"
                                value={newSubscriber.status}
                                onChange={handleInputChange}
                              >
                                <option value="pending">Pending</option>
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
                              required
                              value={newSubscriber.registrationDate}
                              onChange={handleInputChange}
                              error={errors.registrationDate}
                            />
                            <FormInput
                              id="expiryDate"
                              label="Expiry Date"
                              type="date"
                              value={newSubscriber.expiryDate}
                              onChange={handleInputChange}
                              error={errors.expiryDate}
                              helpText="Leave empty for no expiry limit"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:w-auto sm:ml-3"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Subscriber"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:w-auto sm:mt-0"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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
                          <SearchableDropdown
                            label="Package"
                            options={packages.map((pkg) => ({
                              value: pkg.value,
                              label: pkg.label,
                            }))}
                            value={editingSubscriber.package}
                            onChange={handleEditPackageSelect}
                            placeholder="Select a package..."
                            searchPlaceholder="Search packages..."
                            helpText="Choose subscription package duration"
                            icon={
                              <PackageIcon className="h-4 w-4 text-blue-600" />
                            }
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

        {/* Delete Confirmation Modal - Following Categories Pattern */}
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
