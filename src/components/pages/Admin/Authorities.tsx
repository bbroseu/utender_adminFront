import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import {
  fetchContractingAuthorities,
  searchContractingAuthorities,
  createContractingAuthority,
  updateContractingAuthority,
  deleteContractingAuthority,
  clearError,
  setSearchQuery,
  setCurrentPage,
  selectContractingAuthorities,
  selectContractingAuthoritiesLoading,
  selectContractingAuthoritiesError,
  selectContractingAuthoritiesTotal,
  selectContractingAuthoritiesCurrentPage,
  selectContractingAuthoritiesItemsPerPage,
  selectContractingAuthoritiesSearchQuery,
  type ContractingAuthority,
} from "../../../store/slices/contractingAuthoritiesSlice";

export function Authorities() {
  const dispatch = useAppDispatch();

  // Redux state
  const authorities = useAppSelector(selectContractingAuthorities);
  const loading = useAppSelector(selectContractingAuthoritiesLoading);
  const error = useAppSelector(selectContractingAuthoritiesError);
  const total = useAppSelector(selectContractingAuthoritiesTotal);
  const currentPage = useAppSelector(selectContractingAuthoritiesCurrentPage);
  const itemsPerPage = useAppSelector(selectContractingAuthoritiesItemsPerPage);
  const searchQuery = useAppSelector(selectContractingAuthoritiesSearchQuery);

  // Local state for UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentAuthority, setCurrentAuthority] =
    useState<ContractingAuthority | null>(null);
  const [newAuthority, setNewAuthority] = useState({
    name: "",
  });
  // Load data on component mount
  useEffect(() => {
    const loadAuthorities = () => {
      if (searchQuery.trim()) {
        dispatch(
          searchContractingAuthorities({
            searchTerm: searchQuery.trim(),
            limit: itemsPerPage,
            page: currentPage,
          })
        );
      } else {
        dispatch(
          fetchContractingAuthorities({
            limit: itemsPerPage,
            page: currentPage,
          })
        );
      }
    };

    loadAuthorities();
  }, [dispatch, currentPage, itemsPerPage, searchQuery]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Debounced search - reset to page 1 when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, dispatch]);
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  // Handle edit button click
  const handleEdit = (authority: ContractingAuthority) => {
    setCurrentAuthority(authority);
    setNewAuthority({
      name: authority.name,
    });
    setShowAddModal(true);
  };

  // Handle delete button click
  const handleDelete = (authority: ContractingAuthority) => {
    setCurrentAuthority(authority);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (currentAuthority) {
      try {
        await dispatch(
          deleteContractingAuthority(currentAuthority.id)
        ).unwrap();
        setShowDeleteModal(false);
        setCurrentAuthority(null);
      } catch (error) {
        console.error("Failed to delete contracting authority:", error);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAuthority({
      ...newAuthority,
      [name]: value,
    });
  };

  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (currentAuthority) {
        // Edit existing authority
        await dispatch(
          updateContractingAuthority({
            id: currentAuthority.id,
            data: newAuthority,
          })
        ).unwrap();
      } else {
        // Add new authority
        await dispatch(createContractingAuthority(newAuthority)).unwrap();
      }

      // Reset form
      setShowAddModal(false);
      setCurrentAuthority(null);
      setNewAuthority({
        name: "",
      });
    } catch (error) {
      console.error("Failed to save contracting authority:", error);
    }
  };
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row: ContractingAuthority) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: <div className="text-right">Actions</div>,
      accessor: "actions",
      render: (row: ContractingAuthority) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            aria-label="Edit"
            onClick={() => handleEdit(row)}
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

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Contracting Authorities
        </h1>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            setCurrentAuthority(null);
            setNewAuthority({
              name: "",
            });
            setShowAddModal(true);
          }}
        >
          Add Authority
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
                placeholder="Search authorities..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-800">{error}</div>
          </div>
        ) : (
          <Table columns={columns} data={authorities} />
        )}
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages || loading}
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> authorities
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
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || loading}
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
                    <Button
                      key={pageNumber}
                      variant={pageNumber === currentPage ? "primary" : "ghost"}
                      className={`relative inline-flex items-center px-4 py-2 border ${
                        pageNumber === currentPage
                          ? "border-blue-500"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      } text-sm font-medium`}
                      onClick={() => handlePageChange(pageNumber)}
                      disabled={loading}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
                <Button
                  variant="ghost"
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || loading}
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

      {/* Add/Edit Authority Modal */}
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
                  {currentAuthority ? "Edit Authority" : "Add New Authority"}
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
                      value={newAuthority.name}
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
                      disabled={loading}
                    >
                      {loading
                        ? currentAuthority
                          ? "Saving..."
                          : "Adding..."
                        : currentAuthority
                        ? "Save Changes"
                        : "Add Authority"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="mt-3 w-full sm:mt-0 sm:col-start-1"
                      onClick={() => setShowAddModal(false)}
                      disabled={loading}
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
                    Delete Authority
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {currentAuthority?.name}?
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
                >
                  Delete
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
