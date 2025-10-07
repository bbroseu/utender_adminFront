import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { SearchIcon, EyeIcon, XIcon, DownloadIcon, FileIcon } from 'lucide-react';
import tendersService, { Tender, TenderSearchParams } from '../../../services/tendersService';
import { useToast, ToastContainer } from '../../ui/Toast';
export function NotificationsSearch() {
  const { toasts, removeToast, success, error } = useToast();
  
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Tender[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  
  // Details modal state
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const itemsPerPage = 20;
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!keyword.trim()) {
      error('Please enter a search keyword');
      return;
    }

    setIsSearching(true);

    try {
      const searchData: TenderSearchParams = {
        page: 1,
        limit: itemsPerPage,
        value: keyword.trim()
      };

      const response = await tendersService.getAll(searchData);
      setSearchResults(response.data);
      setTotalResults(response.total);
      setHasSearched(true);
      
      success(`Found ${response.total} tender(s) matching "${keyword}"`);
    } catch (err) {
      console.error('Search error:', err);
      error('Failed to search tenders. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };
  const handleReset = () => {
    setKeyword('');
    setSearchResults([]);
    setHasSearched(false);
    setTotalResults(0);
  };

  // Handle view details
  const handleViewDetails = (tender: Tender) => {
    setSelectedTender(tender);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setSelectedTender(null);
    setShowDetailsModal(false);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return tendersService.formatDate(dateString);
  };
  return <div className="relative">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Search Tenders</h1>
      </div>
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch}>
          <div className="space-y-4">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                Search Tenders
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input 
                  type="text" 
                  id="keyword" 
                  className="block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm
                    transition-colors duration-200
                    border-input focus:border-primary focus:ring-primary/30
                    focus:ring-2 focus:outline-none
                    text-foreground placeholder:text-muted-foreground text-sm" 
                  placeholder="Search by title, description, reference number, or any keyword..." 
                  value={keyword} 
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleReset}
                disabled={isSearching}
              >
                Clear
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                icon={<SearchIcon className="h-4 w-4" />} 
                disabled={isSearching || !keyword.trim()}
              >
                {isSearching ? 'Searching...' : 'Search Tenders'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
      {/* Search Results */}
      {hasSearched && <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-900">
              Search Results
            </h2>
            {totalResults > 0 && (
              <span className="text-sm text-gray-500">
                {totalResults} tender(s) found
              </span>
            )}
          </div>
          
          {searchResults.length === 0 ? <Card>
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No results found for your search criteria.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            </Card> : <div className="space-y-4">
              {searchResults.map(tender => <Card key={tender.id}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg text-gray-900 flex-1 mr-4">
                        {tender.title}
                      </h3>
                      <Badge variant={tendersService.isTenderExpired(tender) ? 'destructive' : 'success'} size="sm">
                        {tendersService.isTenderExpired(tender) ? 'Expired' : 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Authority:</span>
                        <span className="ml-2 text-gray-900">{tender.contracting_authority_name || 'Unknown Authority'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-blue-600">{tender.notice_type_name || 'Unknown Type'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Published:</span>
                        <span className="ml-2 text-gray-900">{formatDate(tender.publication_date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deadline:</span>
                        <span className={`ml-2 ${tendersService.isTenderExpired(tender) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {formatDate(tender.expiry_date)}
                        </span>
                      </div>
                      {tender.category_name && (
                        <div>
                          <span className="text-gray-500">Category:</span>
                          <span className="ml-2 text-gray-900">{tender.category_name}</span>
                        </div>
                      )}
                      {tender.procurement_number && (
                        <div>
                          <span className="text-gray-500">Reference:</span>
                          <span className="ml-2 text-gray-900">{tender.procurement_number}</span>
                        </div>
                      )}
                    </div>
                    
                    {tender.description && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                        <span className="text-gray-500">Description:</span>
                        <p className="mt-1">{tender.description.length > 200 ? `${tender.description.substring(0, 200)}...` : tender.description}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {tender.cmimi && (
                          <span>Estimated Value: {tender.cmimi}</span>
                        )}
                        {tendersService.getTenderDocuments(tender).length > 0 && (
                          <span>{tendersService.getTenderDocuments(tender).length} document(s)</span>
                        )}
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={<EyeIcon className="h-4 w-4" />}
                        onClick={() => handleViewDetails(tender)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>)}
            </div>}
        </div>}

      {/* Tender Details Modal */}
      {showDetailsModal && selectedTender && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Tender Details
                  </h3>
                  <button
                    onClick={closeDetailsModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Tender Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTender.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Procurement Number</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTender.procurement_number || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contracting Authority</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTender.contracting_authority_name || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type of Notice</label>
                    <p className="mt-1">
                      <Badge variant="primary" size="sm">
                        {selectedTender.notice_type_name || 'Unknown Type'}
                      </Badge>
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTender.category_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Region</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTender.region_name || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Publication Date</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTender.publication_date)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <p className={`mt-1 text-sm ${tendersService.isTenderExpired(selectedTender) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {formatDate(selectedTender.expiry_date)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">
                      <Badge variant={tendersService.isTenderExpired(selectedTender) ? 'destructive' : 'success'} size="sm">
                        {tendersService.isTenderExpired(selectedTender) ? 'Expired' : 'Active'}
                      </Badge>
                    </p>
                  </div>
                  
                  {selectedTender.cmimi && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estimated Value</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTender.cmimi}</p>
                    </div>
                  )}
                  
                  {selectedTender.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTender.email}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedTender.description && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedTender.description}</p>
                    </div>
                  </div>
                )}

                {/* Documents Section */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Documents</h4>
                  {(() => {
                    const documents = tendersService.getTenderDocuments(selectedTender);
                    if (documents.length === 0) {
                      return (
                        <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md">No documents available for this tender.</p>
                      );
                    }
                    return (
                      <div className="bg-gray-50 border border-gray-200 rounded-md">
                        <ul className="divide-y divide-gray-200">
                          {documents.map((doc, index) => (
                            <li key={index} className="p-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                  <p className="text-sm text-gray-500">{doc.field.replace('_', ' ').toUpperCase()}</p>
                                </div>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                icon={<DownloadIcon className="h-4 w-4" />}
                                onClick={() => tendersService.downloadFile(selectedTender.id, doc.name)}
                              >
                                Download
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button variant="secondary" onClick={closeDetailsModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>;
}