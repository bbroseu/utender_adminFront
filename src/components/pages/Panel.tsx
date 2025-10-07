import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Pagination } from '../ui/Pagination';
import { SearchIcon, FileTextIcon, UsersIcon, EyeIcon, EditIcon, Trash2Icon, XIcon, DownloadIcon, FileIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast, ToastContainer } from '../ui/Toast';
import tendersService, { Tender } from '../../services/tendersService';
export function Panel() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error } = useToast();
  
  // State to track which tender is being viewed
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  // State for document modal
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);
  // State for real tender data
  const [recentTenders, setRecentTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load recent tenders on component mount
  useEffect(() => {
    loadRecentTenders();
  }, []);

  const loadRecentTenders = async (page: number = currentPage, search?: string) => {
    try {
      setLoading(true);
      const response = await tendersService.getAll({ 
        limit: itemsPerPage,
        page: page,
        value: search || searchTerm || undefined
      });
      setRecentTenders(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      console.error('Error loading recent tenders:', err);
      error('Failed to load tenders', err.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  // Function to navigate to add tender page
  const handleAddTender = () => {
    navigate('/admin/add-tender');
  };
  // Function to handle viewing a tender
  const handleViewTender = (tender: Tender) => {
    setSelectedTender(tender);
  };
  
  // Function to handle editing a tender
  const handleEditTender = (tender: Tender) => {
    navigate(`/admin/edit-tender/${tender.id}`);
  };
  
  // Function to handle deleting a tender
  const handleDeleteTender = (tender: Tender) => {
    setTenderToDelete(tender);
    setShowDeleteModal(true);
  };

  // Function to confirm and execute delete
  const confirmDelete = async () => {
    if (!tenderToDelete) return;

    try {
      await tendersService.deleteTender(tenderToDelete.id);
      success('Tender Deleted', `"${tenderToDelete.title}" has been successfully deleted.`);
      // Reload tenders list
      loadRecentTenders(currentPage);
      // Close modal
      setShowDeleteModal(false);
      setTenderToDelete(null);
    } catch (err: any) {
      console.error('Error deleting tender:', err);
      error('Delete Failed', err.message || 'Failed to delete tender. Please try again.');
    }
  };
  // Function to close the tender detail modal
  const closeTenderDetail = () => {
    setSelectedTender(null);
  };
  // Function to handle viewing documents
  const handleViewDocuments = (tender: Tender, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTender(tender);
    setShowDocumentModal(true);
  };
  
  // Function to handle document download
  const handleDownloadDocument = async (document: { name: string; field: string }) => {
    if (!selectedTender) return;
    
    try {
      await tendersService.downloadFile(selectedTender.id, document.name);
      success('Download Started', `Downloading ${document.name}`);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      error('Download Failed', err.message || 'Failed to download document. Please try again.');
    }
  };

  // Function to handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRecentTenders(page);
  };

  // Function to handle search
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const search = e.target.value;
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when searching
    loadRecentTenders(1, search);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (endDateStr: string) => {
    if (!endDateStr) return 'No end date';
    const endDate = new Date(endDateStr);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Expired';
    } else if (diffDays === 1) {
      return '1 day';
    } else {
      return `${diffDays} days`;
    }
  };
  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{totalItems}</span> tenders
            </div>
            <Button variant="primary" size="md" icon={<PlusIcon className="h-4 w-4 mr-1" />} onClick={handleAddTender}>
              Add Tender
            </Button>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input 
                type="text" 
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
                  transition-colors duration-200
                  border-input focus:border-primary focus:ring-primary/30
                  focus:ring-2 focus:outline-none
                  text-foreground placeholder:text-muted-foreground text-sm" 
                placeholder="Search tenders..." 
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
          <Card title="Recent Tenders" titleClassName="bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : recentTenders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No tenders found matching your search.' : 'No recent tenders available.'}
              </div>
            ) : (
              <div className="space-y-4">
                {recentTenders.map(tender => {
                  const documents = tendersService.getTenderDocuments(tender);
                  return (
                    <div key={tender.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="flex-1">
                          <h4 
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2" 
                            onClick={() => handleViewTender(tender)}
                            title={tender.title}
                          >
                            {tender.title.length > 80 ? `${tender.title.substring(0, 80)}...` : tender.title}
                          </h4>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <span>{tender.contracting_authority_name || 'Unknown Authority'}</span>
                            <span className="mx-2">•</span>
                            <span>{tender.category_name || 'No Category'}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap justify-between md:justify-start md:space-x-4">
                            <span className="text-xs text-gray-500">
                              Published: {tender.publication_date ? tendersService.formatDate(tender.publication_date) : 'Unknown'}
                            </span>
                            <span className="text-xs font-medium text-red-600">
                              Ends in {calculateDaysLeft(tender.expiry_date)}
                            </span>
                            {documents.length > 0 && (
                              <Button variant="ghost" size="xs" className="mt-1 md:mt-0" icon={<FileIcon className="h-3 w-3 mr-1" />} onClick={e => handleViewDocuments(tender, e)}>
                                {documents.length}{' '}
                                {documents.length === 1 ? 'Document' : 'Documents'}
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex mt-2 md:mt-0 space-x-2 md:self-start">
                          <Button variant="primary" size="sm" onClick={() => handleViewTender(tender)}>
                            <EyeIcon className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleEditTender(tender)}>
                            <EditIcon className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteTender(tender)}>
                            <Trash2Icon className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {!loading && totalItems > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </Card>
        </div>
      </div>
      {/* Tender Detail Modal */}
      {selectedTender && !showDocumentModal && <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Tender Details
              </h3>
              <button onClick={closeTenderDetail} className="text-gray-400 hover:text-gray-500">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedTender.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Contracting Authority
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.contracting_authority_name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.category_name || 'No Category'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Publication Date
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.publication_date ? tendersService.formatDate(selectedTender.publication_date) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">End Date</p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.expiry_date ? tendersService.formatDate(selectedTender.expiry_date) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Procurement Number</p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.procurement_number || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Region</p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.region_name || 'Not specified'}
                  </p>
                </div>
              </div>
              {selectedTender.description && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedTender.description}
                  </p>
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Documents
                </p>
                {(() => {
                  const documents = tendersService.getTenderDocuments(selectedTender);
                  if (documents.length === 0) {
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-center text-gray-500">
                        No documents available
                      </div>
                    );
                  }
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {documents.map((doc, index) => (
                          <li key={index} className="px-4 py-3 flex justify-between items-center">
                            <div className="flex items-center">
                              <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Document
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" icon={<DownloadIcon className="h-4 w-4" />} onClick={() => handleDownloadDocument(doc)}>
                              Download
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })()}
              </div>
              {selectedTender.email && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">
                        {selectedTender.email}
                      </p>
                    </div>
                    {selectedTender.cmimi && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Price</p>
                        <p className="text-sm text-gray-900">
                          €{selectedTender.cmimi.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <Button variant="secondary" onClick={closeTenderDetail}>
                Close
              </Button>
              <Button variant="primary" onClick={() => handleEditTender(selectedTender)}>
                Edit Tender
              </Button>
            </div>
          </div>
        </div>}
      {/* Document Modal */}
      {showDocumentModal && selectedTender && <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {selectedTender.title} - Documents
                    </h3>
                    <div className="mt-2">
                      {(() => {
                        const documents = tendersService.getTenderDocuments(selectedTender);
                        if (documents.length === 0) {
                          return (
                            <div className="text-center py-4 text-gray-500">
                              No documents available for this tender.
                            </div>
                          );
                        }
                        return (
                          <ul className="divide-y divide-gray-200">
                            {documents.map((doc, index) => (
                              <li key={index} className="py-3 flex justify-between items-center">
                                <div className="flex items-center">
                                  <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {doc.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Document
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" icon={<DownloadIcon className="h-4 w-4" />} onClick={() => handleDownloadDocument(doc)}>
                                  Download
                                </Button>
                              </li>
                            ))}
                          </ul>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button variant="secondary" onClick={() => setShowDocumentModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && tenderToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
                    Delete Tender
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete "{tenderToDelete.title}"?
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
                  onClick={() => {
                    setShowDeleteModal(false);
                    setTenderToDelete(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }