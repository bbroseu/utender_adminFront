import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { useToast, ToastContainer } from "../../ui/Toast";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { AppDispatch } from "../../../store";
import {
  fetchContractTypes,
  createContractType,
  updateContractType,
  deleteContractType,
  selectContractTypes,
  selectContractTypesLoading,
  selectContractTypesError,
  selectContractTypesCreating,
  selectContractTypesUpdating,
  selectContractTypesDeleting,
  clearError,
  ContractType,
} from "../../../store/slices/contractTypesSlice";
export function ContractTypes() {
  const dispatch = useDispatch<AppDispatch>();
  const contractTypes = useSelector(selectContractTypes);
  const isLoading = useSelector(selectContractTypesLoading);
  const error = useSelector(selectContractTypesError);
  const isCreating = useSelector(selectContractTypesCreating);
  const isUpdating = useSelector(selectContractTypesUpdating);
  const isDeleting = useSelector(selectContractTypesDeleting);
  const toast = useToast();

  useEffect(() => {
    dispatch(fetchContractTypes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error("Error", error);
      dispatch(clearError());
    }
  }, [error, toast, dispatch]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [currentType, setCurrentType] = useState<ContractType | null>(null);
  const [newType, setNewType] = useState({
    name: "",
  });
  // Filter contract types based on search query
  const filteredTypes = useMemo(() => {
    return contractTypes.filter((type) => {
      return (
        searchQuery === "" ||
        type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (type.code &&
          type.code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (type.description &&
          type.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [contractTypes, searchQuery]);

  // Pagination calculations
  const totalItems = filteredTypes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTypes = filteredTypes.slice(startIndex, endIndex);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  // Handle edit button click
  const handleEdit = (type: ContractType) => {
    console.log("Editing contract type:", type);
    console.log("Contract type ID:", type.id);
    setCurrentType(type);
    setNewType({
      name: type.name,
    });
    setShowAddModal(true);
  };
  // Handle delete button click
  const handleDelete = (type: ContractType) => {
    setCurrentType(type);
    setShowDeleteModal(true);
  };
  // Confirm delete
  const confirmDelete = async () => {
    if (currentType) {
      try {
        await dispatch(deleteContractType(currentType.id)).unwrap();
        toast.success("Success", "Contract type deleted successfully");
        setShowDeleteModal(false);
        setCurrentType(null);
      } catch (error) {
        // Error handling is done in the useEffect
      }
    }
  };
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNewType({
      ...newType,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentType) {
        // Edit existing type
        await dispatch(
          updateContractType({
            id: currentType.id,
            data: newType,
          })
        ).unwrap();
        toast.success("Success", "Contract type updated successfully");
      } else {
        // Add new type
        await dispatch(createContractType(newType)).unwrap();
        toast.success("Success", "Contract type created successfully");
      }

      // Reset form
      setShowAddModal(false);
      setCurrentType(null);
      setNewType({
        name: "",
      });
    } catch (error) {
      // Error handling is done in the useEffect
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
      header: "Actions",
      accessor: "actions",
      headerClassName: "flex justify-end",
      render: (row) => (
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
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Contract Types</h1>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            setCurrentType(null);
            setNewType({
              name: "",
            });
            setShowAddModal(true);
          }}
        >
          Add Contract Type
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
                placeholder="Search contract types..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{totalItems}</span> contract types
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading contract types...</div>
          </div>
        ) : (
          <>
            <Table columns={columns} data={paginatedTypes} />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              loading={isLoading}
            />
          </>
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
                  {currentType ? "Edit Contract Type" : "Add Contract Type"}
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
                      value={newType.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                      placeholder="Enter contract type name"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:col-start-2"
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating
                        ? currentType
                          ? "Saving..."
                          : "Creating..."
                        : currentType
                        ? "Save Changes"
                        : "Add Contract Type"}
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
                    Delete Contract Type
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {currentType?.name}? This
                      action cannot be undone.
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

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}
