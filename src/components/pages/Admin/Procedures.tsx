import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Dropdown } from "../../ui/Dropdown";
import { ToastContainer, useToast } from "../../ui/Toast";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import proceduresService, {
  Procedure,
} from "../../../services/proceduresService";
export function Procedures() {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProcedure, setCurrentProcedure] = useState<Procedure | null>(
    null
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [newProcedure, setNewProcedure] = useState({
    name: "",
    description: "",
    minDuration: 30,
    isActive: true,
  });

  // Load procedures on component mount
  useEffect(() => {
    loadProcedures();
  }, []);

  const loadProcedures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await proceduresService.getAll();
      // Ensure data is an array
      const proceduresArray = Array.isArray(data) ? data : [];
      console.log("Loaded procedures:", proceduresArray); // Debug log
      setProcedures(proceduresArray);
    } catch (err: any) {
      console.error("Error loading procedures:", err);
      const errorMessage = err.message || "Failed to load procedures";
      setError(errorMessage);
      toast.error("Loading Failed", errorMessage);
      setProcedures([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  // Filter procedures based on search query
  const filteredProcedures = Array.isArray(procedures)
    ? procedures.filter((procedure) => {
        return (
          searchQuery === "" ||
          procedure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (procedure.description &&
            procedure.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        );
      })
    : [];

  // Pagination calculations
  const totalItems = filteredProcedures.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProcedures = filteredProcedures.slice(startIndex, endIndex);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  // Handle edit button click
  const handleEdit = (procedure: Procedure) => {
    console.log("Editing procedure:", procedure); // Debug log
    setCurrentProcedure(procedure);
    setNewProcedure({
      name: procedure.name,
      description: procedure.description || "",
      minDuration: procedure.minDuration || 30,
      isActive: procedure.isActive !== undefined ? procedure.isActive : true,
    });
    setShowAddModal(true);
  };
  // Handle delete button click
  const handleDelete = (procedure: Procedure) => {
    setCurrentProcedure(procedure);
    setShowDeleteModal(true);
  };
  // Confirm delete
  const confirmDelete = async () => {
    if (!currentProcedure) return;

    try {
      setDeleteLoading(true);
      await proceduresService.delete(currentProcedure.id);
      setProcedures((prevProcedures) =>
        Array.isArray(prevProcedures)
          ? prevProcedures.filter((p) => p.id !== currentProcedure.id)
          : []
      );
      setShowDeleteModal(false);
      setCurrentProcedure(null);
      toast.success(
        "Deleted Successfully",
        `Procedure "${currentProcedure.name}" has been deleted.`
      );
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete procedure";
      setError(errorMessage);
      toast.error("Delete Failed", errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    const isNumber = type === "number";

    setNewProcedure({
      ...newProcedure,
      [name]: isCheckbox
        ? (e.target as HTMLInputElement).checked
        : isNumber
        ? parseInt(value) || 0
        : value,
    });
  };

  // Handle dropdown changes
  const handleStatusChange = (value: string) => {
    setNewProcedure({
      ...newProcedure,
      isActive: value === "true",
    });
  };
  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      setError(null);

      if (currentProcedure) {
        // Edit existing procedure
        console.log(
          "Updating procedure with ID:",
          currentProcedure.id,
          "Data:",
          newProcedure
        ); // Debug log
        const updatedProcedure = await proceduresService.update(
          currentProcedure.id,
          newProcedure
        );
        setProcedures((prevProcedures) =>
          Array.isArray(prevProcedures)
            ? prevProcedures.map((p) =>
                p.id === currentProcedure.id ? updatedProcedure : p
              )
            : [updatedProcedure]
        );
        toast.success(
          "Updated Successfully",
          `Procedure "${newProcedure.name}" has been updated.`
        );
      } else {
        // Add new procedure
        const createdProcedure = await proceduresService.create(newProcedure);
        console.log(
          "Created procedure received in component:",
          createdProcedure
        ); // Debug log
        setProcedures((prevProcedures) => {
          const newProcedures = Array.isArray(prevProcedures)
            ? [...prevProcedures, createdProcedure]
            : [createdProcedure];
          console.log("Updated procedures array:", newProcedures); // Debug log
          return newProcedures;
        });
        toast.success(
          "Created Successfully",
          `Procedure "${newProcedure.name}" has been created.`
        );
      }

      // Reset form
      setShowAddModal(false);
      setCurrentProcedure(null);
      setNewProcedure({
        name: "",
        description: "",
        minDuration: 30,
        isActive: true,
      });
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save procedure";
      setError(errorMessage);
      toast.error("Save Failed", errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: () => <div className="flex justify-end">Actions</div>,
      accessor: "actions",
      render: (row) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            aria-label="Edit"
            onClick={() => {
              console.log("Edit button clicked with row:", row); // Debug log
              handleEdit(row);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-800"
            icon={<TrashIcon className="h-4 w-4" />}
            aria-label="Delete"
            onClick={() => handleDelete(row)}
          />
        </div>
      ),
    },
  ];
  const statusOptions = [
    { value: "true", label: "Active" },
    { value: "false", label: "Inactive" },
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
          Procurement Procedures
        </h1>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            setCurrentProcedure(null);
            setNewProcedure({
              name: "",
              description: "",
              minDuration: 30,
              isActive: true,
            });
            setShowAddModal(true);
          }}
        >
          Add Procedure
        </Button>
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search procedures..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        <Table columns={columns} data={paginatedProcedures} />
        {totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {totalItems > 0 ? (
                    <>
                      <span className="font-medium">
                        {Math.min(
                          (currentPage - 1) * itemsPerPage + 1,
                          totalItems
                        )}
                        -{Math.min(currentPage * itemsPerPage, totalItems)}
                      </span>{" "}
                      of <span className="font-medium">{totalItems}</span>
                    </>
                  ) : (
                    "No results found"
                  )}
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
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </Button>

                  {/* Page numbers */}
                  {(() => {
                    const maxVisiblePages = 5;
                    const halfVisible = Math.floor(maxVisiblePages / 2);
                    let startPage = Math.max(1, currentPage - halfVisible);
                    let endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    // Adjust startPage if we're near the end
                    if (endPage - startPage + 1 < maxVisiblePages) {
                      startPage = Math.max(1, endPage - maxVisiblePages + 1);
                    }

                    const pages = [];

                    // Show first page and ellipsis if needed
                    if (startPage > 1) {
                      pages.push(
                        <Button
                          key={1}
                          variant="ghost"
                          className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </Button>
                      );
                      if (startPage > 2) {
                        pages.push(
                          <span
                            key="ellipsis-start"
                            className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                    }

                    // Show pages in range
                    for (let i = startPage; i <= endPage; i++) {
                      const isCurrentPage = i === currentPage;
                      pages.push(
                        <Button
                          key={i}
                          variant={isCurrentPage ? "primary" : "ghost"}
                          className={`relative inline-flex items-center px-2 py-1 border text-xs font-medium ${
                            isCurrentPage
                              ? "border-blue-500"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </Button>
                      );
                    }

                    // Show last page and ellipsis if needed
                    if (endPage < totalPages) {
                      if (endPage < totalPages - 1) {
                        pages.push(
                          <span
                            key="ellipsis-end"
                            className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      pages.push(
                        <Button
                          key={totalPages}
                          variant="ghost"
                          className="relative inline-flex items-center px-2 py-1 border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </Button>
                      );
                    }

                    return pages;
                  })()}

                  <Button
                    variant="ghost"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && (
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentProcedure ? "Edit Procedure" : "Add Procedure"}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={newProcedure.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:col-start-2"
                      disabled={submitLoading}
                    >
                      {submitLoading
                        ? "Saving..."
                        : currentProcedure
                        ? "Save Changes"
                        : "Add Procedure"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full sm:mt-0 sm:col-start-1"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
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
                    Delete Procedure
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {currentProcedure?.name}?
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <Button
                  type="button"
                  variant="danger"
                  className="w-full sm:col-start-2"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
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
  );
}
