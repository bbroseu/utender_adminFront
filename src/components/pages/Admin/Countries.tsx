import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import regionsService, { Region } from "../../../services/regionsService";
import { useToast, ToastContainer } from "../../ui/Toast";

export function Countries() {
  const [countries, setCountries] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCountry, setCurrentCountry] = useState<Region | null>(null);
  const [newCountry, setNewCountry] = useState({
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await regionsService.getAll();
      
      // If no countries exist, add the default ones
      if (data.length === 0) {
        await seedDefaultCountries();
        // Reload after seeding
        const newData = await regionsService.getAll();
        // Sort by creation date (newest first) or by ID (highest first)
        const sortedData = newData.sort((a, b) => {
          if (a.create_date && b.create_date) {
            return b.create_date - a.create_date;
          }
          return (b.id || 0) - (a.id || 0);
        });
        setCountries(sortedData);
      } else {
        // Sort by creation date (newest first) or by ID (highest first)
        const sortedData = data.sort((a, b) => {
          if (a.create_date && b.create_date) {
            return b.create_date - a.create_date;
          }
          return (b.id || 0) - (a.id || 0);
        });
        setCountries(sortedData);
      }
    } catch (err: any) {
      console.error('Error loading countries:', err);
      setError('Failed to load countries');
      toast.error("Loading Failed", "Failed to load countries. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultCountries = async () => {
    const defaultCountries = ['Kosova', 'Maqedonia', 'Albania'];
    
    try {
      for (const countryName of defaultCountries) {
        await regionsService.create({ name: countryName });
      }
      toast.success("Countries Initialized", "Default countries have been added successfully.");
    } catch (err) {
      console.error('Error seeding default countries:', err);
      // Don't show error toast for seeding issues, just log them
    }
  };

  // Filter countries based on search query
  const filteredCountries = countries.filter((country) => {
    return (
      searchQuery === "" ||
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Update total items when filtered countries change
  React.useEffect(() => {
    setTotalItems(filteredCountries.length);
    setCurrentPage(1); // Reset to first page when search changes
  }, [filteredCountries.length, searchQuery]);

  // Paginate the filtered countries
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCountries = filteredCountries.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle edit button click
  const handleEdit = (country: Region) => {
    setCurrentCountry(country);
    setNewCountry({
      name: country.name,
    });
    setShowAddModal(true);
  };

  // Handle delete button click
  const handleDelete = (country: Region) => {
    setCurrentCountry(country);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!currentCountry) return;
    
    try {
      setIsSubmitting(true);
      await regionsService.delete(currentCountry.id);
      
      toast.success("Country Deleted", `"${currentCountry.name}" has been deleted successfully.`);
      
      // Refresh the countries list
      await loadCountries();
      
      setShowDeleteModal(false);
      setCurrentCountry(null);
    } catch (err: any) {
      console.error('Error deleting country:', err);
      toast.error("Delete Failed", err.message || 'Failed to delete country. It may have dependent records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCountry({
      ...newCountry,
      [name]: value,
    });
  };

  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const countryData = {
        name: newCountry.name,
      };
      
      console.log('Country data being submitted:', countryData);
      
      if (currentCountry) {
        // Edit existing country
        await regionsService.update(currentCountry.id, countryData);
        toast.success("Country Updated", `"${countryData.name}" has been updated successfully.`);
      } else {
        // Add new country
        try {
          await regionsService.create(countryData);
          toast.success("Country Created", `"${countryData.name}" has been created successfully.`);
        } catch (createError) {
          console.log('Create had issues, but continuing to refresh list:', createError);
          toast.warning("Country Creation", "Country may have been created. Please check the list below.");
        }
      }
      
      // Always refresh the countries list
      await loadCountries();
      
      // Reset form
      setShowAddModal(false);
      setCurrentCountry(null);
      setNewCountry({
        name: "",
      });
    } catch (err: any) {
      console.error('Error saving country:', err);
      toast.error("Save Failed", err.message || 'Failed to save country. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Country Name",
      accessor: "name",
      render: (row: Region) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: Region) => (
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading countries...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
        <Button onClick={loadCountries} className="ml-4">Retry</Button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Countries
          </h1>
          <Button
            variant="primary"
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => {
              setCurrentCountry(null);
              setNewCountry({
                name: "",
              });
              setShowAddModal(true);
            }}
          >
            Add Country
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
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{totalItems}</span> countries
              </div>
            </div>
          </div>
          
          <Table columns={columns} data={paginatedCountries} />
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>

        {/* Add/Edit Country Modal */}
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
                    {currentCountry ? "Edit Country" : "Add Country"}
                  </h3>
                  <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Country Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={newCountry.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                        placeholder="e.g., United States, Germany, Japan"
                      />
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:col-start-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : (currentCountry ? "Save Changes" : "Add Country")}
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
                      Delete Country
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{currentCountry?.name}"?
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Deleting..." : "Delete"}
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