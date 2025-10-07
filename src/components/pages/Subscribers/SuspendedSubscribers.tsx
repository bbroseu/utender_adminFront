import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { SearchIcon, TrashIcon, RefreshCcwIcon } from "lucide-react";
import sepUsersService, { SepUser } from "../../../services/sepUsersService";
import { useToast, ToastContainer } from "../../ui/Toast";

export function SuspendedSubscribers() {
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
  const [totalPages, setTotalPages] = useState(0);

  // State for delete forever confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSubscriber, setDeleteSubscriber] = useState<SepUser | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // State for refund confirmation modal
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundSubscriber, setRefundSubscriber] = useState<SepUser | null>(
    null
  );
  const [isRefunding, setIsRefunding] = useState(false);

  // Load suspended subscribers when component mounts or pagination changes
  useEffect(() => {
    loadSuspendedSubscribers();
  }, [currentPage, searchQuery]);

  // Add debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when search changes
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadSuspendedSubscribers = async () => {
    try {
      setLoading(true);
      setApiError(null);
      // Get users with status 2 (suspended) with pagination
      const response = await sepUsersService.getByStatusPaginated(
        2,
        currentPage,
        itemsPerPage,
        searchQuery || undefined
      );
      console.log(
        "Loaded suspended subscribers (status 2) with pagination:",
        response
      );

      setSubscribers(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error("Error loading suspended subscribers:", err);
      setApiError(err.message || "Failed to load suspended subscribers");
      error(
        "Failed to load suspended subscribers",
        err.message || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle delete forever confirmation
  const handleDeleteClick = (subscriber: SepUser) => {
    setDeleteSubscriber(subscriber);
    setShowDeleteModal(true);
  };

  // Handle delete forever confirmation
  const handleDeleteConfirm = async () => {
    if (!deleteSubscriber) return;

    try {
      setIsDeleting(true);
      await sepUsersService.delete(deleteSubscriber.id);

      success(
        "Subscriber Deleted Forever",
        `"${
          deleteSubscriber.username || deleteSubscriber.email
        }" has been permanently deleted.`
      );

      // Refresh the subscribers list
      await loadSuspendedSubscribers();

      setShowDeleteModal(false);
      setDeleteSubscriber(null);
    } catch (err: any) {
      console.error("Error deleting subscriber:", err);
      error(
        "Delete Failed",
        err.message ||
          "Failed to delete subscriber permanently. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle refund click
  const handleRefundClick = (subscriber: SepUser) => {
    setRefundSubscriber(subscriber);
    setShowRefundModal(true);
  };

  // Handle refund confirmation
  const handleRefundConfirm = async () => {
    if (!refundSubscriber) return;

    try {
      setIsRefunding(true);
      // Reactivate the subscriber (set active = 1)
      await sepUsersService.update(refundSubscriber.id, {
        active: 1,
      });

      success(
        "Subscriber Refunded",
        `"${
          refundSubscriber.username || refundSubscriber.email
        }" has been refunded and reactivated.`
      );

      // Refresh the subscribers list
      await loadSuspendedSubscribers();

      setShowRefundModal(false);
      setRefundSubscriber(null);
    } catch (err: any) {
      console.error("Error refunding subscriber:", err);
      error(
        "Refund Failed",
        err.message || "Failed to refund subscriber. Please try again."
      );
    } finally {
      setIsRefunding(false);
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
        <div className="text-gray-900 font-medium">{row.pako || "-"}</div>
      ),
    },
    {
      header: "Suspension Date",
      accessor: "suspend_date",
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
            icon={<RefreshCcwIcon className="h-4 w-4" />}
            onClick={() => handleRefundClick(row)}
            aria-label="Refund Subscriber"
            title="Refund Subscriber"
            className="text-green-600 hover:text-green-800"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDeleteClick(row)}
            aria-label="Delete Forever"
            title="Delete Forever"
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
            <Button onClick={loadSuspendedSubscribers} variant="primary">
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
            Suspended Subscribers
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
                  placeholder="Search suspended subscribers..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <Table columns={columns} data={subscribers} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>

        {/* Delete Forever Confirmation Modal */}
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
                      Delete Subscriber Forever
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to permanently delete{" "}
                        {deleteSubscriber.name
                          ? `${deleteSubscriber.name} (@${deleteSubscriber.username})`
                          : deleteSubscriber.username}
                        ? This action cannot be undone and will remove all data
                        permanently.
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
                    {isDeleting ? "Deleting..." : "Delete Forever"}
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

        {/* Refund Confirmation Modal */}
        {showRefundModal && refundSubscriber && (
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
                    <RefreshCcwIcon
                      className="h-6 w-6 text-green-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Refund Subscriber
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to refund and reactivate{" "}
                        {refundSubscriber.name || refundSubscriber.username}?
                        This will restore their access and remove them from the
                        suspended list.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:col-start-2"
                    onClick={handleRefundConfirm}
                    disabled={isRefunding}
                  >
                    {isRefunding ? "Processing..." : "Refund & Reactivate"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={() => setShowRefundModal(false)}
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
