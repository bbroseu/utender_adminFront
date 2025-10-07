import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { FormInput } from "../../ui/FormInput";
import { ToastContainer, useToast } from "../../ui/Toast";
import {
  SearchIcon,
  CheckIcon,
  XIcon,
  AlertCircleIcon,
  EditIcon,
  CalendarIcon,
  TrashIcon,
} from "lucide-react";
import sepUsersService, { SepUser } from "../../../services/sepUsersService";

export function ApproveSubscriber() {
  const [subscribers, setSubscribers] = useState<SepUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{
    [key: number]: "approve" | "reject" | null;
  }>({});
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Confirmation modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [subscriberToApprove, setSubscriberToApprove] =
    useState<SepUser | null>(null);

  // Load subscribers on component mount
  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get users with status 0 (pending approval)
      const data = await sepUsersService.getByStatus(0);
      console.log("Loaded pending subscribers (status 0):", data);
      // Data should already be filtered to status 0 users from the API
      const subscribersArray = Array.isArray(data) ? data : [];
      setSubscribers(subscribersArray);
    } catch (err: any) {
      console.error("Error loading subscribers:", err);
      const errorMessage = err.message || "Failed to load subscribers";
      setError(errorMessage);
      toast.error("Loading Failed", errorMessage);
      setSubscribers([]);
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
              .includes(searchQuery.toLowerCase()))
        );
      })
    : [];

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle edit subscriber
  const handleEdit = (subscriber: SepUser) => {
    // TODO: Implement edit functionality
    toast.success(
      "Edit Feature",
      `Edit functionality for ${subscriber.username} will be implemented.`
    );
  };

  // Handle extend deadline
  const handleExtendDeadline = (subscriber: SepUser) => {
    // TODO: Implement extend deadline functionality
    toast.success(
      "Extend Deadline",
      `Extend deadline functionality for ${subscriber.username} will be implemented.`
    );
  };

  // Handle delete subscriber
  const handleDelete = async (subscriber: SepUser) => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to delete ${subscriber.username}? This action cannot be undone.`
      );
      if (!confirmed) return;

      await sepUsersService.delete(subscriber.id);
      toast.success(
        "Deleted Successfully",
        `${subscriber.username} has been deleted.`
      );

      // Reload the subscribers list
      await loadSubscribers();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete subscriber";
      setError(errorMessage);
      toast.error("Delete Failed", errorMessage);
    }
  };

  // Show approve confirmation modal
  const showApproveConfirmation = (subscriber: SepUser) => {
    setSubscriberToApprove(subscriber);
    setShowApproveModal(true);
  };

  // Handle approve subscriber
  const handleApprove = async () => {
    if (!subscriberToApprove) return;

    setActionLoading((prev) => ({
      ...prev,
      [subscriberToApprove.id]: "approve",
    }));

    try {
      // Use the new activate endpoint
      await sepUsersService.activate(subscriberToApprove.id);

      toast.success(
        "Approved Successfully",
        `${
          subscriberToApprove.username || subscriberToApprove.email
        } has been approved.`
      );

      // Close modal and reset state
      setShowApproveModal(false);
      setSubscriberToApprove(null);

      // Reload the subscribers list to remove approved user from table
      await loadSubscribers();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to approve subscriber";
      setError(errorMessage);
      toast.error("Approve Failed", errorMessage);
    } finally {
      setActionLoading((prev) => ({ ...prev, [subscriberToApprove.id]: null }));
    }
  };

  // Handle reject subscriber
  const handleReject = async (subscriber: SepUser) => {
    setActionLoading((prev) => ({ ...prev, [subscriber.id]: "reject" }));

    try {
      await sepUsersService.updateStatus(subscriber.id, 0); // Set status to inactive
      await sepUsersService.updateActive(subscriber.id, 0); // Set active to false

      toast.success(
        "Rejected Successfully",
        `${subscriber.username} has been rejected.`
      );

      // Reload the subscribers list to remove rejected user from table
      await loadSubscribers();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to reject subscriber";
      setError(errorMessage);
      toast.error("Reject Failed", errorMessage);
    } finally {
      setActionLoading((prev) => ({ ...prev, [subscriber.id]: null }));
    }
  };

  const columns = [
    {
      header: "Name / Username",
      accessor: "name",
      render: (row: SepUser) => (
        <div>
          <div className="font-medium text-gray-900">{row.username || "-"}</div>
        </div>
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
      header: "Phone",
      accessor: "phone",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.phone || "-"}</div>
      ),
    },
    {
      header: "Contact Person",
      accessor: "p_kontaktues",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.email || "-"}</div>
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
      header: "Fiscal Number",
      accessor: "fiscal_number",
      render: (row: SepUser) => (
        <div className="text-gray-900">{row.fiscal_number || "-"}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: SepUser) => {
        const currentAction = actionLoading[row.id];

        return (
          <div className="flex space-x-2">
            <Button
              variant="success"
              size="sm"
              icon={<CheckIcon className="h-4 w-4" />}
              onClick={() => showApproveConfirmation(row)}
              aria-label="Approve Subscriber"
              title="Approve Subscriber"
            >
              {currentAction === "approve" ? "Approving..." : "Approve"}
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<XIcon className="h-4 w-4" />}
              onClick={() => handleReject(row)}
              aria-label="Reject Subscriber"
              title="Reject Subscriber"
            >
              {currentAction === "reject" ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertCircleIcon className="h-4 w-4 mr-2" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Approve Subscribers
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
                placeholder="Search subscribers..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        <Table columns={columns} data={filteredSubscribers} />
      </div>

      {/* Approve Confirmation Modal */}
      {showApproveModal && subscriberToApprove && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Approve Member
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve{" "}
                  <span className="font-semibold">
                    {subscriberToApprove.company ||
                      subscriberToApprove.username ||
                      subscriberToApprove.email}
                  </span>
                  ?
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  This will activate their account and grant them access to the
                  platform.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowApproveModal(false);
                      setSubscriberToApprove(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={handleApprove}
                    disabled={
                      actionLoading[subscriberToApprove.id] === "approve"
                    }
                    className="flex-1"
                  >
                    {actionLoading[subscriberToApprove.id] === "approve"
                      ? "Approving..."
                      : "Approve"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
