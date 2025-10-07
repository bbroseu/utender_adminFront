import React, { useEffect, useState, Children, Fragment } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { SearchableInput } from "../../ui/SearchableInput";
import { Badge } from "../../ui/Badge";
import {
  SearchIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  ArrowRightIcon,
} from "lucide-react";
export function SubCategories() {
  // Sample data
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Construction",
      description: "Building and civil engineering works",
      code: "CONST",
      parentCategory: null,
      isActive: true,
    },
    {
      id: 2,
      name: "IT Services",
      description: "Information technology and related services",
      code: "IT",
      parentCategory: null,
      isActive: true,
    },
    {
      id: 3,
      name: "Medical Equipment",
      description: "Medical and laboratory equipment and supplies",
      code: "MED",
      parentCategory: null,
      isActive: true,
    },
    {
      id: 4,
      name: "Office Supplies",
      description: "Stationery and office materials",
      code: "OFF",
      parentCategory: null,
      isActive: true,
    },
    {
      id: 5,
      name: "Software Development",
      description: "Custom software development services",
      code: "SOFT",
      parentCategory: "IT Services",
      isActive: true,
    },
    {
      id: 6,
      name: "Network Infrastructure",
      description: "Network setup and maintenance services",
      code: "NET",
      parentCategory: "IT Services",
      isActive: true,
    },
    {
      id: 7,
      name: "Residential Buildings",
      description: "Construction of residential properties",
      code: "RES",
      parentCategory: "Construction",
      isActive: true,
    },
    {
      id: 8,
      name: "Commercial Buildings",
      description: "Construction of commercial properties",
      code: "COM",
      parentCategory: "Construction",
      isActive: true,
    },
    {
      id: 9,
      name: "Diagnostic Equipment",
      description: "Medical diagnostic machinery",
      code: "DIAG",
      parentCategory: "Medical Equipment",
      isActive: true,
    },
    {
      id: 10,
      name: "Web Development",
      description: "Website and web application development",
      code: "WEB",
      parentCategory: "Software Development",
      isActive: true,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [newSubCategory, setNewSubCategory] = useState({
    name: "",
    description: "",
    code: "",
    parentCategory: "",
    isActive: true,
  });
  // Initialize parent categories and subcategories
  useEffect(() => {
    const parents = categories.filter((c) => c.parentCategory === null);
    setParentCategories(parents);
    if (selectedParentCategory) {
      const subs = categories.filter(
        (c) => c.parentCategory === selectedParentCategory
      );
      setSubCategories(subs);
    } else {
      const allSubs = categories.filter((c) => c.parentCategory !== null);
      setSubCategories(allSubs);
    }
  }, [categories, selectedParentCategory]);
  // Filter subcategories based on search query and selected parent
  const filteredSubCategories = subCategories.filter((category) => {
    return (
      searchQuery === "" ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });
  // Get parent category options for dropdown
  const parentCategoryOptions = [
    {
      value: "",
      label: "All Parent Categories",
    },
    ...parentCategories.map((parent) => ({
      value: parent.name,
      label: parent.name,
    })),
  ];
  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  // Handle parent category selection
  const handleParentCategoryChange = (value) => {
    setSelectedParentCategory(value);
  };
  // Handle edit button click
  const handleEdit = (subCategory) => {
    setCurrentSubCategory(subCategory);
    setNewSubCategory({
      name: subCategory.name,
      description: subCategory.description || "",
      code: subCategory.code,
      parentCategory: subCategory.parentCategory || "",
      isActive: subCategory.isActive,
    });
    setShowAddModal(true);
  };
  // Handle delete button click
  const handleDelete = (subCategory) => {
    setCurrentSubCategory(subCategory);
    setShowDeleteModal(true);
  };
  // Confirm delete
  const confirmDelete = () => {
    // Check if this subcategory has child categories
    const hasChildren = categories.some(
      (c) => c.parentCategory === currentSubCategory.name
    );
    if (hasChildren) {
      alert(
        "Cannot delete a subcategory that has child categories. Please delete or reassign the child categories first."
      );
      setShowDeleteModal(false);
      return;
    }
    setCategories(categories.filter((c) => c.id !== currentSubCategory.id));
    setShowDeleteModal(false);
    setCurrentSubCategory(null);
  };
  // Handle form input changes
  const handleInputChange = (name, value) => {
    setNewSubCategory({
      ...newSubCategory,
      [name]: value,
    });
  };
  // Handle add/edit form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate parent category is selected
    if (!newSubCategory.parentCategory) {
      alert("Please select a parent category.");
      return;
    }
    // Validate that a category can't be its own parent
    if (
      currentSubCategory &&
      newSubCategory.parentCategory === currentSubCategory.name
    ) {
      alert("A category cannot be its own parent.");
      return;
    }
    // Check for circular references
    if (
      checkCircularReference(
        newSubCategory.parentCategory,
        currentSubCategory?.name
      )
    ) {
      alert(
        "This would create a circular reference in the category hierarchy."
      );
      return;
    }
    if (currentSubCategory) {
      // Edit existing subcategory
      setCategories(
        categories.map((c) =>
          c.id === currentSubCategory.id
            ? {
                ...c,
                ...newSubCategory,
              }
            : c
        )
      );
    } else {
      // Add new subcategory
      const newId = Math.max(...categories.map((c) => c.id)) + 1;
      setCategories([
        ...categories,
        {
          id: newId,
          ...newSubCategory,
        },
      ]);
    }
    // Reset form
    setShowAddModal(false);
    setCurrentSubCategory(null);
    setNewSubCategory({
      name: "",
      description: "",
      code: "",
      parentCategory: "",
      isActive: true,
    });
  };
  // Check for circular references in category hierarchy
  const checkCircularReference = (parentName, childName) => {
    if (!childName) return false;
    if (parentName === childName) return true;
    const parent = categories.find((c) => c.name === parentName);
    if (!parent || !parent.parentCategory) return false;
    return checkCircularReference(parent.parentCategory, childName);
  };
  // Table columns
  const columns = [
    {
      header: "Name",
      accessor: "name",
      render: (row) => (
        <div className="font-medium text-gray-900">{row.name}</div>
      ),
    },
    {
      header: "Code",
      accessor: "code",
      render: (row) => (
        <div className="text-sm font-mono bg-gray-100 px-2 py-1 rounded inline-block">
          {row.code}
        </div>
      ),
    },
    {
      header: "Parent Category",
      accessor: "parentCategory",
      render: (row) => (
        <div className="flex items-center">
          <Badge variant="primary" size="md">
            {row.parentCategory}
          </Badge>
        </div>
      ),
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Status",
      accessor: "isActive",
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            row.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex space-x-2">
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
  // Find category hierarchy path
  const getCategoryPath = (categoryName) => {
    const path = [];
    let current = categoryName;
    while (current) {
      path.unshift(current);
      const parent = categories.find((c) => c.name === current);
      current = parent?.parentCategory;
    }
    return path;
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Sub-Categories</h1>
        <Button
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
          onClick={() => {
            setCurrentSubCategory(null);
            setNewSubCategory({
              name: "",
              description: "",
              code: "",
              parentCategory: selectedParentCategory || "",
              isActive: true,
            });
            setShowAddModal(true);
          }}
        >
          Add Sub-Category
        </Button>
      </div>
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="md:w-1/3">
              <label
                htmlFor="parentCategory"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Parent Category
              </label>
              <SearchableInput
                id="parentCategory"
                options={parentCategoryOptions}
                value={selectedParentCategory}
                onChange={handleParentCategoryChange}
                placeholder="Select a parent category..."
              />
            </div>
            <div className="md:w-2/3">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Sub-Categories
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name, code, or description..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
      {filteredSubCategories.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <Table columns={columns} data={filteredSubCategories} />
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No sub-categories found.</p>
            {selectedParentCategory ? (
              <p className="text-sm text-gray-400 mt-1">
                There are no sub-categories for "{selectedParentCategory}". Add
                one using the button above.
              </p>
            ) : (
              <p className="text-sm text-gray-400 mt-1">
                Try selecting a different parent category or add a new
                sub-category.
              </p>
            )}
          </div>
        </Card>
      )}
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
                  {currentSubCategory
                    ? "Edit Sub-Category"
                    : "Add Sub-Category"}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="parentCategory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Parent Category <span className="text-red-500">*</span>
                    </label>
                    <SearchableInput
                      id="parentCategory"
                      options={parentCategories.map((parent) => ({
                        value: parent.name,
                        label: parent.name,
                      }))}
                      value={newSubCategory.parentCategory}
                      onChange={(value) =>
                        handleInputChange("parentCategory", value)
                      }
                      placeholder="Select a parent category..."
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={newSubCategory.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      id="code"
                      value={newSubCategory.code}
                      onChange={(e) =>
                        handleInputChange("code", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Short code for the sub-category (e.g., WEB, RES)
                    </p>
                  </div>
                  <div>
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
                      value={newSubCategory.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={newSubCategory.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isActive"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                  {currentSubCategory && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Category Path
                      </h4>
                      <div className="flex items-center flex-wrap gap-2">
                        {getCategoryPath(currentSubCategory.parentCategory).map(
                          (cat, index, array) => (
                            <Fragment key={index}>
                              <Badge
                                variant={
                                  index === array.length - 1
                                    ? "primary"
                                    : "secondary"
                                }
                                size="sm"
                              >
                                {cat}
                              </Badge>
                              {index < array.length - 1 && (
                                <ArrowRightIcon className="h-3 w-3 text-gray-400" />
                              )}
                            </Fragment>
                          )
                        )}
                        <ArrowRightIcon className="h-3 w-3 text-gray-400" />
                        <Badge variant="success" size="sm">
                          {currentSubCategory.name}
                        </Badge>
                      </div>
                    </div>
                  )}
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full sm:col-start-2"
                    >
                      {currentSubCategory ? "Save Changes" : "Add Sub-Category"}
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
                    Delete Sub-Category
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete {currentSubCategory?.name}
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
