import React, { useState, useEffect, useMemo } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import categoriesService, {
  Category,
} from "../../../services/categoriesService";
import { useToast, ToastContainer } from "../../ui/Toast";
export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    code: "",
    parentCategory: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err: any) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
      toast.error(
        "Loading Failed",
        "Failed to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique parent categories for dropdown
  const parentCategoryOptions = [
    ...new Set(
      categories.filter((c) => c.parentCategory === null).map((c) => c.name)
    ),
  ];
  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      return (
        searchQuery === "" ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [categories, searchQuery]);

  // Pagination calculations
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

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
  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    // Find parent category name
    const parentCat = categories.find((c) => c.id === category.parent_id);
    setNewCategory({
      name: category.name,
      description: category.description || "",
      code: category.code || "",
      parentCategory: parentCat ? parentCat.name : "",
      isActive: category.isActive !== false,
    });
    setShowAddModal(true);
  };
  // Handle delete button click
  const handleDelete = (category: Category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };
  // Confirm delete
  const confirmDelete = async () => {
    if (!currentCategory) return;

    try {
      setIsSubmitting(true);
      await categoriesService.delete(currentCategory.id);

      toast.success(
        "Category Deleted",
        `"${currentCategory.name}" has been deleted successfully.`
      );

      // Refresh the categories list
      await loadCategories();

      setShowDeleteModal(false);
      setCurrentCategory(null);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      toast.error(
        "Delete Failed",
        err.message ||
          "Failed to delete category. It may have dependent records."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = "checked" in e.target ? e.target.checked : false;
    setNewCategory({
      ...newCategory,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const categoryData = {
        name: newCategory.name,
      };

      console.log("Category data being submitted:", categoryData); // Debug log

      if (currentCategory) {
        // Edit existing category
        await categoriesService.update(currentCategory.id, categoryData);
        toast.success(
          "Category Updated",
          `"${categoryData.name}" has been updated successfully.`
        );
      } else {
        // Add new category
        try {
          await categoriesService.create(categoryData);
          toast.success(
            "Category Created",
            `"${categoryData.name}" has been created successfully.`
          );
        } catch (createError) {
          console.log(
            "Create had issues, but continuing to refresh list:",
            createError
          );
          toast.warning(
            "Category Creation",
            "Category may have been created. Please check the list below."
          );
        }
      }

      // Always refresh the categories list to see if the category was actually created
      await loadCategories();

      // Reset form
      setShowAddModal(false);
      setCurrentCategory(null);
      setNewCategory({
        name: "",
        description: "",
        code: "",
        parentCategory: "",
        isActive: true,
      });
    } catch (err: any) {
      console.error("Error saving category:", err);
      toast.error(
        "Save Failed",
        err.message || "Failed to save category. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
        <Button onClick={loadCategories} className="ml-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tender Categories
          </h1>
          <Button
            variant="primary"
            icon={<PlusIcon className="h-4 w-4" />}
            onClick={() => {
              setCurrentCategory(null);
              setNewCategory({
                name: "",
                description: "",
                code: "",
                parentCategory: "",
                isActive: true,
              });
              setShowAddModal(true);
            }}
          >
            Add Category
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
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <Table columns={columns} data={paginatedCategories} />
          
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
                    {currentCategory ? "Edit Category" : "Add Category"}
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
                        value={newCategory.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div style={{ display: "none" }}>
                      <label
                        htmlFor="code"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        value={newCategory.code}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Short code for the category (e.g., CONST, IT)
                      </p>
                    </div>
                    <div style={{ display: "none" }}>
                      <label
                        htmlFor="parentCategory"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Parent Category
                      </label>
                      <select
                        name="parentCategory"
                        id="parentCategory"
                        value={newCategory.parentCategory}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">None (Top Level)</option>
                        {parentCategoryOptions.map((category) => (
                          <option
                            key={category}
                            value={category}
                            disabled={
                              currentCategory &&
                              currentCategory.name === category
                            }
                          >
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "none" }}>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        name="description"
                        id="description"
                        rows={3}
                        value={newCategory.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    <div
                      style={{ display: "none" }}
                      className="flex items-center"
                    >
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={newCategory.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isActive"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Active
                      </label>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                      <Button
                        type="submit"
                        variant="primary"
                        className="w-full sm:col-start-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? "Saving..."
                          : currentCategory
                          ? "Save Changes"
                          : "Add Category"}
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
                      Delete Category
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {currentCategory?.name}?
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
