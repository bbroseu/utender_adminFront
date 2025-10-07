import React, { useState, useEffect } from 'react';
import { Table } from '../../ui/Table';
import { Button } from '../../ui/Button';
import { SearchIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import noticeTypesService, { NoticeType } from '../../../services/noticeTypesService';
import { useToast, ToastContainer } from '../../ui/Toast';

export function NotificationTypes() {
  const [types, setTypes] = useState<NoticeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentType, setCurrentType] = useState<NoticeType | null>(null);
  const [newType, setNewType] = useState({
    name: '',
    description: '',
    code: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load notice types when component mounts or pagination changes
  useEffect(() => {
    loadNoticeTypes();
  }, [currentPage, searchQuery]);

  const loadNoticeTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await noticeTypesService.getPaginated(
        currentPage, 
        itemsPerPage, 
        searchQuery || undefined
      );
      
      // Sort by creation date (newest first) or by ID (highest first)
      const sortedData = response.data.sort((a, b) => {
        if (a.create_date && b.create_date) {
          return b.create_date - a.create_date;
        }
        return (b.id || 0) - (a.id || 0);
      });
      
      setTypes(sortedData);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error loading notice types:', err);
      setError('Failed to load notification types');
      toast.error("Loading Failed", "Failed to load notification types. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when search changes
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // Handle edit button click
  const handleEdit = (type: NoticeType) => {
    setCurrentType(type);
    setNewType({
      name: type.name || '',
      description: '',
      code: '',
      isActive: true
    });
    setShowAddModal(true);
  };

  // Handle delete button click
  const handleDelete = (type: NoticeType) => {
    setCurrentType(type);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!currentType) return;
    
    try {
      setIsSubmitting(true);
      await noticeTypesService.delete(currentType.id);
      
      toast.success("Notification Type Deleted", `"${currentType.name}" has been deleted successfully.`);
      
      // Refresh the list
      await loadNoticeTypes();
      
      setShowDeleteModal(false);
      setCurrentType(null);
    } catch (err: any) {
      console.error('Error deleting notification type:', err);
      toast.error("Delete Failed", err.message || 'Failed to delete notification type. It may have dependent records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = 'checked' in e.target ? e.target.checked : false;
    setNewType({
      ...newType,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle add/edit form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const noticeTypeData = {
        notice: newType.name, // Backend uses 'notice' field
      };
      
      console.log('Notice type data being submitted:', noticeTypeData);
      
      if (currentType) {
        // Edit existing type
        await noticeTypesService.update(currentType.id, noticeTypeData);
        toast.success("Notification Type Updated", `"${noticeTypeData.notice}" has been updated successfully.`);
      } else {
        // Add new type
        try {
          await noticeTypesService.create(noticeTypeData);
          toast.success("Notification Type Created", `"${noticeTypeData.notice}" has been created successfully.`);
        } catch (createError) {
          console.log('Create had issues, but continuing to refresh list:', createError);
          toast.warning("Notification Type Creation", "Notification type may have been created. Please check the list below.");
        }
      }
      
      // Always refresh the list
      await loadNoticeTypes();
      
      // Reset form
      setShowAddModal(false);
      setCurrentType(null);
      setNewType({
        name: '',
        description: '',
        code: '',
        isActive: true
      });
    } catch (err: any) {
      console.error('Error saving notification type:', err);
      toast.error("Save Failed", err.message || 'Failed to save notification type. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const columns = [{
    header: 'Name',
    accessor: 'name',
    render: (row: NoticeType) => <div className="font-medium text-gray-900">{row.name}</div>
  }, {
    header: <div className="text-right">Actions</div>,
    accessor: 'actions',
    render: (row: NoticeType) => <div className="flex space-x-2 justify-end">
          <Button variant="ghost" size="sm" icon={<EditIcon className="h-4 w-4" />} aria-label="Edit" onClick={() => handleEdit(row)} />
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" icon={<TrashIcon className="h-4 w-4" />} aria-label="Delete" onClick={() => handleDelete(row)} />
        </div>
  }];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading notification types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
        <Button onClick={loadNoticeTypes} className="ml-4">Retry</Button>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Notification Types
        </h1>
        <Button variant="primary" icon={<PlusIcon className="h-4 w-4" />} onClick={() => {
        setCurrentType(null);
        setNewType({
          name: '',
          description: '',
          code: '',
          isActive: true
        });
        setShowAddModal(true);
      }}>
          Add Notification Type
        </Button>
      </div>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search notification types..." value={searchQuery} onChange={handleSearch} />
            </div>
          </div>
        </div>
        <Table columns={columns} data={types} />
        
        {/* Pagination */}
        {totalPages > 1 && (
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
                    {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> notification types
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
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNumber === currentPage
                            ? "border-blue-500"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
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
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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
        )}
      </div>
      {/* Add/Edit Modal */}
      {showAddModal && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {currentType ? 'Edit Notification Type' : 'Add Notification Type'}
                </h3>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input type="text" name="name" id="name" value={newType.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                  </div>
                  <div style={{ display: 'none' }}>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                      Code
                    </label>
                    <input type="text" name="code" id="code" value={newType.code} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                    <p className="mt-1 text-xs text-gray-500">
                      Short code for the notification type (e.g., CN, PIN)
                    </p>
                  </div>
                  <div style={{ display: 'none' }}>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea name="description" id="description" rows={3} value={newType.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                  </div>
                  <div style={{ display: 'none' }} className="flex items-center">
                    <input type="checkbox" name="isActive" id="isActive" checked={newType.isActive} onChange={handleInputChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button type="submit" variant="primary" className="w-full sm:col-start-2" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : (currentType ? 'Save Changes' : 'Add Notification Type')}
                    </Button>
                    <Button type="button" variant="secondary" className="mt-3 w-full sm:mt-0 sm:col-start-1" onClick={() => setShowAddModal(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Delete Notification Type
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{currentType?.name}"? This
                      action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <Button type="button" variant="danger" className="w-full sm:col-start-2" onClick={confirmDelete} disabled={isSubmitting}>
                  {isSubmitting ? "Deleting..." : "Delete"}
                </Button>
                <Button type="button" variant="secondary" className="mt-3 w-full sm:mt-0 sm:col-start-1" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>}
      </div>
    </>
  );
}