import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { FormInput } from "../../ui/FormInput";
import { SearchableInput } from "../../ui/SearchableInput";
import { SearchableDropdown } from "../../ui/SearchableDropdown";
import { MultiSelectDropdown } from "../../ui/MultiSelectDropdown";
import { FormTextarea } from "../../ui/FormTextarea";
import {
  SearchIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  FileIcon,
  DownloadIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";
import tendersService, {
  Tender,
  TenderSearchParams,
} from "../../../services/tendersService";
import noticeTypesService, {
  NoticeType,
} from "../../../services/noticeTypesService";
import { useToast, ToastContainer } from "../../ui/Toast";
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../store/api/endpoints";

// Sample subcategories data (moved outside component to prevent recreation)
const allSubCategories = [
  { id: 5, name: 'Software Development', parentCategory: 'IT Services', code: 'SOFT' },
  { id: 6, name: 'Network Infrastructure', parentCategory: 'IT Services', code: 'NET' },
  { id: 7, name: 'Residential Buildings', parentCategory: 'Construction', code: 'RES' },
  { id: 8, name: 'Commercial Buildings', parentCategory: 'Construction', code: 'COM' },
  { id: 9, name: 'Diagnostic Equipment', parentCategory: 'Medical Equipment', code: 'DIAG' },
  { id: 10, name: 'Web Development', parentCategory: 'Software Development', code: 'WEB' },
  { id: 11, name: 'Mobile Development', parentCategory: 'Software Development', code: 'MOB' },
  { id: 12, name: 'Office Paper', parentCategory: 'Office Supplies', code: 'PAPER' },
  { id: 13, name: 'Writing Instruments', parentCategory: 'Office Supplies', code: 'WRITE' }
];

export function NotificationsAll() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const loadingRef = useRef(false);
  const lastParamsRef = useRef<string>('');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dropdown data
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [procedures, setProcedures] = useState<any[]>([]);
  const [contractTypes, setContractTypes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
    category: "",
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Details modal
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTender, setEditTender] = useState<Tender | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSelectedAuthorities, setEditSelectedAuthorities] = useState<string[]>([]);
  const [editSelectedAuthorityIds, setEditSelectedAuthorityIds] = useState<any[]>([]);
  const [editSubCategories, setEditSubCategories] = useState<any[]>([]);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tenderToDelete, setTenderToDelete] = useState<Tender | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load initial data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      await loadDropdownData();
      // loadTenders will be called by the other useEffect once loadingOptions becomes false
    };
    loadInitialData();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadDropdownData = async () => {
    try {
      setLoadingOptions(true);

      // Load contracting authorities
      const authoritiesResponse = await api.get(
        API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_ALL
      );
      const authoritiesData = authoritiesResponse.data.success
        ? authoritiesResponse.data.data
        : authoritiesResponse.data;

      // Load notice types
      const noticeTypesData = await noticeTypesService.getAll();

      // Load categories
      const categoriesResponse = await api.get(
        API_ENDPOINTS.CATEGORIES.GET_ALL
      );
      const categoriesData = categoriesResponse.data.success
        ? categoriesResponse.data.data
        : categoriesResponse.data;

      // Load procedures
      const proceduresResponse = await fetch('https://api.utender.eu/api/procedures');
      const proceduresData = await proceduresResponse.json();
      const procedures = proceduresData.success ? proceduresData.data : proceduresData;

      // Load contract types
      const contractTypesResponse = await fetch('https://api.utender.eu/api/contract-types');
      const contractTypesData = await contractTypesResponse.json();
      const contractTypes = contractTypesData.success ? contractTypesData.data : contractTypesData;

      // Load countries/states
      const countriesResponse = await api.get('/states');
      const countriesData = countriesResponse.data;
      const countries = countriesData.success ? countriesData.data : countriesData;

      // Load regions
      const regionsResponse = await api.get('/regions');
      const regionsData = regionsResponse.data;
      const regions = regionsData.success ? regionsData.data : regionsData;

      setAuthorities(Array.isArray(authoritiesData) ? authoritiesData : []);
      setNoticeTypes(noticeTypesData);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setProcedures(Array.isArray(procedures) ? procedures : []);
      setContractTypes(Array.isArray(contractTypes) ? contractTypes : []);
      setCountries(Array.isArray(countries) ? countries : []);
      setRegions(Array.isArray(regions) ? regions : []);
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      // Don't show error toast for dropdown data, just log
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadTenders = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (loadingRef.current) {
      console.log('loadTenders: Already loading, skipping...');
      return;
    }
    
    console.log('loadTenders: Starting API call...');
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const searchParams: TenderSearchParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (debouncedSearchTerm) searchParams.value = debouncedSearchTerm;
      if (selectedType) {
        // selectedType now contains the ID directly
        searchParams.notice_type_id = parseInt(selectedType);
      }
      if (selectedAuthority) {
        // selectedAuthority now contains the ID directly
        searchParams.contracting_authority_id = parseInt(selectedAuthority);
      }
      if (filters.dateFrom) searchParams.date_from = filters.dateFrom;
      if (filters.dateTo) searchParams.date_to = filters.dateTo;
      if (filters.category)
        searchParams.category_id = parseInt(filters.category);
      if (filters.status) searchParams.status = filters.status;

      // Check if parameters have actually changed
      const paramsString = JSON.stringify(searchParams);
      if (lastParamsRef.current === paramsString) {
        console.log('loadTenders: Same parameters, skipping API call');
        return;
      }
      lastParamsRef.current = paramsString;

      const response = await tendersService.getAll(searchParams);

      setTenders(response.data);
      setTotalItems(response.total);
      setTotalPages(response.totalPages);

      // Reset to page 1 if current page is beyond total pages
      if (response.totalPages > 0 && currentPage > response.totalPages) {
        setCurrentPage(1);
      }
    } catch (err: any) {
      console.error("Error loading tenders:", err);
      
      // Handle different types of errors
      let errorMessage = "Failed to load tenders";
      if (err.message?.includes('timeout')) {
        errorMessage = "Request timed out. The server might be busy.";
      } else if (err.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      setError(errorMessage);
      
      // Don't show toast for timeout errors to avoid spam
      if (!err.message?.includes('timeout')) {
        toast.error("Loading Failed", errorMessage);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    selectedType,
    selectedAuthority,
    filters.dateFrom,
    filters.dateTo,
    filters.category,
    filters.status,
  ]);

  // Load tenders when search parameters change (moved after loadTenders definition)
  useEffect(() => {
    if (!loadingOptions) {
      // Only load tenders after dropdown options are loaded
      // loadingRef.current prevents multiple simultaneous calls
      loadTenders();
    }
  }, [
    loadTenders,
    loadingOptions,
  ]);

  // Generate dropdown options from backend data (memoized to prevent recreation)
  const authorityOptions = useMemo(() => [
    { value: "", label: "All Authorities" },
    ...authorities.map((authority) => ({
      value: authority.id.toString(),
      label: authority.name,
    })),
  ], [authorities]);

  const noticeTypeOptions = useMemo(() => [
    { value: "", label: "All Types" },
    ...noticeTypes.map((type) => ({
      value: type.id.toString(),
      label: type.notice || type.name || "Unknown Type",
    })),
  ], [noticeTypes]);

  // Handle search input changes (memoized to prevent recreation)
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Page reset is handled by the debounced effect
  }, []);

  // Handle dropdown changes (memoized to prevent recreation)
  const handleTypeChange = useCallback((value: string) => {
    setSelectedType(value);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const handleAuthorityChange = useCallback((value: string) => {
    setSelectedAuthority(value);
    setCurrentPage(1); // Reset to first page on filter change
  }, []);
  // Apply filters
  const applyFilters = () => {
    const newActiveFilters = [];
    if (filters.status) {
      newActiveFilters.push({
        id: "status",
        label: `Status: ${
          filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
        }`,
      });
    }
    if (filters.dateFrom) {
      newActiveFilters.push({
        id: "dateFrom",
        label: `From: ${new Date(filters.dateFrom).toLocaleDateString()}`,
      });
    }
    if (filters.dateTo) {
      newActiveFilters.push({
        id: "dateTo",
        label: `To: ${new Date(filters.dateTo).toLocaleDateString()}`,
      });
    }
    if (filters.category) {
      const selectedCategory = categories.find(
        (cat) => cat.id.toString() === filters.category
      );
      newActiveFilters.push({
        id: "category",
        label: `Category: ${
          selectedCategory ? selectedCategory.name : filters.category
        }`,
      });
    }
    setActiveFilters(newActiveFilters);
    setShowFilterModal(false);
  };
  // Remove a specific filter
  const removeFilter = (filterId) => {
    setFilters({
      ...filters,
      [filterId]: "",
    });
    setActiveFilters(activeFilters.filter((filter) => filter.id !== filterId));
  };
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: "",
      dateFrom: "",
      dateTo: "",
      category: "",
    });
    setActiveFilters([]);
    setShowFilterModal(false);
  };
  // Handle row click to view details
  const handleRowClick = (row: Tender) => {
    handleViewDetails(row);
  };

  // Handle view details
  const handleViewDetails = (row: Tender, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTender(row);
    setShowDetailsModal(true);
  };

  // Handle edit tender
  const handleEditTender = (row: Tender, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    // Initialize edit tender with all current data including IDs
    setEditTender({ 
      ...row,
      // Add ID fields for dropdowns
      categoryId: row.category_id || "",
      contractTypeId: row.contract_type_id || "",
      procedureId: row.procedures_id || "",
      noticeTypeId: row.notice_type_id || "",
      countryId: row.states_id || "",
      regionId: row.region_id || "",
      link: row.link || "",
      retendering: Boolean(row.retendering)
    });
    
    // Set authorities
    if (row.contracting_authority_id) {
      const authority = authorities.find((auth: any) => auth.id == row.contracting_authority_id);
      if (authority) {
        setEditSelectedAuthorities([authority.name]);
        setEditSelectedAuthorityIds([row.contracting_authority_id]);
      }
    } else {
      setEditSelectedAuthorities([]);
      setEditSelectedAuthorityIds([]);
    }

    // Set subcategories based on category
    if (row.category_id) {
      const category = categories.find((cat: any) => cat.id == row.category_id);
      if (category) {
        const filteredSubCategories = allSubCategories.filter(sc => sc.parentCategory === category.name);
        setEditSubCategories(filteredSubCategories);
      }
    } else {
      setEditSubCategories([]);
    }
    
    setShowEditModal(true);
  };

  // Handle edit modal dropdown changes
  const handleEditAuthorityChange = (values: any[]) => {
    const authorityNames = values.map(id => {
      const authority = authorities.find((auth: any) => auth.id == id);
      return authority?.name || '';
    }).filter(name => name);
    
    setEditSelectedAuthorityIds(values);
    setEditSelectedAuthorities(authorityNames);
  };

  const handleEditCategoryChange = (categoryId: any) => {
    if (editTender) {
      const selectedCategory = categories.find((cat: any) => cat.id == categoryId);
      
      setEditTender({
        ...editTender,
        categoryId: categoryId,
        category_name: selectedCategory?.name || '',
        subCategory: '' // Clear subcategory when category changes
      });

      // Update subcategories
      if (selectedCategory) {
        const filteredSubCategories = allSubCategories.filter(sc => sc.parentCategory === selectedCategory.name);
        setEditSubCategories(filteredSubCategories);
      } else {
        setEditSubCategories([]);
      }
    }
  };

  const handleEditFormChange = (field: string, value: any) => {
    if (editTender) {
      setEditTender({
        ...editTender,
        [field]: value
      });
    }
  };

  // Handle delete tender - show confirmation modal
  const handleDeleteTender = (row: Tender, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTenderToDelete(row);
    setShowDeleteModal(true);
  };

  // Confirm delete action
  const confirmDelete = async () => {
    if (!tenderToDelete) return;

    setDeleteLoading(true);
    try {
      await tendersService.deleteTender(tenderToDelete.id);
      toast.success(
        "Tender Deleted",
        `"${tenderToDelete.title}" has been deleted successfully.`
      );

      setShowDeleteModal(false);
      setTenderToDelete(null);

      // Reload the tenders list
      loadTenders();
    } catch (error: any) {
      console.error("Error deleting tender:", error);

      // Handle specific error cases
      if (error.status === 401) {
        toast.error(
          "Authentication Required",
          "Please log in to delete tenders."
        );
      } else if (error.status === 403) {
        toast.error(
          "Permission Denied",
          "You do not have permission to delete this tender."
        );
      } else if (error.status === 404) {
        toast.error(
          "Tender Not Found",
          "The tender you are trying to delete no longer exists."
        );
        loadTenders(); // Refresh the list to remove the non-existent tender
      } else {
        toast.error(
          "Delete Failed",
          error.message || "Failed to delete tender. Please try again."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editTender) return;

    setEditLoading(true);
    try {
      // Prepare update data with all fields including IDs
      const updateData: any = {};

      // Basic fields
      if (editTender.link) updateData.link = editTender.link;
      if (editTender.title) updateData.title = editTender.title;
      if (editTender.procurement_number) updateData.procurement_number = editTender.procurement_number;
      if (editTender.description) updateData.description = editTender.description;
      if (editTender.email) updateData.email = editTender.email;
      if (editTender.cmimi) updateData.cmimi = editTender.cmimi.toString();

      // Dropdown IDs
      if (editTender.categoryId) updateData.category_id = editTender.categoryId;
      if (editTender.contractTypeId) updateData.contract_type_id = editTender.contractTypeId;
      if (editTender.procedureId) updateData.procedures_id = editTender.procedureId;
      if (editTender.noticeTypeId) updateData.notice_type_id = editTender.noticeTypeId;
      if (editTender.countryId) updateData.states_id = editTender.countryId;
      if (editTender.regionId) updateData.region_id = editTender.regionId;

      // Contracting Authority
      if (editSelectedAuthorityIds.length > 0) {
        updateData.contracting_authority_id = editSelectedAuthorityIds[0];
      }

      // Dates (if they exist)
      if (editTender.publication_date) {
        updateData.publication_date = Math.floor(new Date(editTender.publication_date).getTime() / 1000);
      }
      if (editTender.expiry_date) {
        updateData.expiry_date = Math.floor(new Date(editTender.expiry_date).getTime() / 1000);
      }

      // Re-tendering
      updateData.retendering = editTender.retendering ? 1 : 0;

      console.log('Updating tender with data:', updateData);

      await tendersService.updateTender(editTender.id, updateData);

      toast.success(
        "Tender Updated",
        `"${editTender.title}" has been updated successfully.`
      );
      setShowEditModal(false);
      setEditTender(null);
      loadTenders();
    } catch (error: any) {
      console.error("Error updating tender:", error);

      // Handle specific error cases
      if (error.status === 401) {
        toast.error(
          "Authentication Required",
          "Please log in to update tenders."
        );
      } else if (error.status === 403) {
        toast.error(
          "Permission Denied",
          "You do not have permission to update this tender."
        );
      } else if (error.status === 404) {
        toast.error(
          "Tender Not Found",
          "The tender you are trying to update no longer exists."
        );
        setShowEditModal(false);
        setEditTender(null);
        loadTenders(); // Refresh the list
      } else {
        toast.error(
          "Update Failed",
          error.message || "Failed to update tender. Please try again."
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  // Handle document download
  const handleDownloadDocument = (doc: { name: string; url: string }) => {
    // Create a temporary link to trigger download
    const link = document.createElement("a");
    link.href = doc.url;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };
  const columns = [
    {
      header: "Contracting Authority",
      accessor: "contracting_authority",
      render: (row: Tender) => (
        <div className="font-medium text-gray-900">
          {row.contracting_authority_name || "Unknown Authority"}
        </div>
      ),
    },
    {
      header: "Contract Type",
      accessor: "contract_type",
      render: (row: Tender) => (
        <Badge
          variant={row.notice_type_name === "Works" ? "success" : "primary"}
          size="md"
        >
          {row.notice_type_name || "Unknown Type"}
        </Badge>
      ),
    },
    {
      header: "Title",
      accessor: "title",
      render: (row: Tender) => (
        <div className="max-w-xs">
          <div
            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
            title={row.title}
          >
            {row.title.length > 50
              ? `${row.title.substring(0, 50)}...`
              : row.title}
          </div>
        </div>
      ),
    },
    {
      header: "Publication Date",
      accessor: "publication_date",
      render: (row: Tender) => formatDate(row.publication_date),
    },
    {
      header: "End Date",
      accessor: "expiry_date",
      render: (row: Tender) => {
        const isExpired = tendersService.isTenderExpired(row);
        return (
          <span className={isExpired ? "text-red-600 font-medium" : ""}>
            {formatDate(row.expiry_date)}
          </span>
        );
      },
    },
    {
      header: <div className="text-right">Actions</div>,
      accessor: "actions",
      render: (row: Tender) => (
        <div className="flex space-x-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            icon={<EyeIcon className="h-4 w-4" />}
            onClick={(e) => handleViewDetails(row, e)}
            aria-label="View Details"
            title="View Details"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            onClick={(e) => handleEditTender(row, e)}
            aria-label="Edit Tender"
            title="Edit Tender"
            className="text-blue-600 hover:text-blue-700"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={(e) => handleDeleteTender(row, e)}
            aria-label="Delete Tender"
            title="Delete Tender"
            className="text-red-600 hover:text-red-700"
          />
        </div>
      ),
    },
  ];
  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Generate dropdown options for edit modal (memoized to prevent recreation)
  const editAuthorityOptions = useMemo(() => authorities.map((authority: any) => ({
    value: authority.id,
    label: authority.name
  })), [authorities]);

  const editNoticeTypeOptions = useMemo(() => [
    { value: '', label: 'Select a type' },
    ...noticeTypes.map((noticeType: any) => ({
      value: noticeType.id,
      label: noticeType.notice || noticeType.name || "Unknown Type"
    }))
  ], [noticeTypes]);

  const editCategoryOptions = useMemo(() => [
    { value: '', label: 'Select a category' },
    ...categories.map((category: any) => ({
      value: category.id,
      label: category.name
    }))
  ], [categories]);

  const editSubCategoryOptions = useMemo(() => [
    { value: '', label: 'Select a subcategory' },
    ...editSubCategories.map((subCat: any) => ({
      value: subCat.name,
      label: subCat.name
    }))
  ], [editSubCategories]);

  const editProcedureOptions = useMemo(() => [
    { value: '', label: 'Select a procedure' },
    ...procedures.map((procedure: any) => ({
      value: procedure.id,
      label: procedure.name
    }))
  ], [procedures]);

  const editContractTypeOptions = useMemo(() => [
    { value: '', label: 'Select a contract type' },
    ...contractTypes.map((contractType: any) => ({
      value: contractType.id,
      label: contractType.name
    }))
  ], [contractTypes]);

  const editCountryOptions = useMemo(() => [
    { value: '', label: 'Select a country' },
    ...countries.map((country: any) => ({
      value: country.id,
      label: country.name
    }))
  ], [countries]);

  const editRegionOptions = useMemo(() => [
    { value: '', label: 'Select a region' },
    ...regions.map((region: any) => ({
      value: region.id,
      label: region.name
    }))
  ], [regions]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading tenders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-600">{error}</div>
        <Button onClick={loadTenders} className="ml-4">
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
          <h1 className="text-2xl font-semibold text-gray-900">All Tenders</h1>
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
                  className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm
                  transition-colors duration-200
                  border-input focus:border-primary focus:ring-primary/30
                  focus:ring-2 focus:outline-none
                  text-foreground placeholder:text-muted-foreground text-sm"
                  placeholder="Search tenders..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <SearchableInput
                    options={noticeTypeOptions}
                    value={selectedType}
                    onChange={handleTypeChange}
                    placeholder="All Types"
                    className="min-w-[180px]"
                    disabled={loadingOptions}
                  />
                </div>
                <div>
                  <SearchableInput
                    options={authorityOptions}
                    value={selectedAuthority}
                    onChange={handleAuthorityChange}
                    placeholder="All Authorities"
                    className="min-w-[180px]"
                    disabled={loadingOptions}
                  />
                </div>
                {/* <Button variant="secondary" size="md" icon={<FilterIcon className="h-4 w-4" />} onClick={() => setShowFilterModal(true)}>
                Filters
              </Button> */}
              </div>
            </div>
            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <div
                    key={filter.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {filter.label}
                    <button
                      type="button"
                      className="ml-1 inline-flex text-blue-500 hover:text-blue-600 focus:outline-none"
                      onClick={() => removeFilter(filter.id)}
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800"
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
          <Table columns={columns} data={tenders} onRowClick={handleRowClick} />
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
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
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
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
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
                      <ChevronRightIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Filters Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-visible">
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
              <div className="inline-block align-bottom bg-white rounded-lg px-6 pt-6 pb-6 text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-8">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Filter Tenders
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Status
                      </label>
                      <SearchableDropdown
                        options={[
                          { value: "", label: "All Statuses" },
                          { value: "active", label: "Active" },
                          { value: "expired", label: "Expired" },
                          { value: "canceled", label: "Canceled" },
                        ]}
                        value={filters.status}
                        onChange={(value) =>
                          setFilters({ ...filters, status: value })
                        }
                        placeholder="All Statuses"
                        className="w-full"
                        id="status"
                      />
                    </div>
                    <div>
                      <FormInput
                        id="dateFrom"
                        label="Publication Date From"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dateFrom: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <FormInput
                        id="dateTo"
                        label="Publication Date To"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            dateTo: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 mb-1.5"
                      >
                        Category
                      </label>
                      <SearchableDropdown
                        options={[
                          { value: "", label: "All Categories" },
                          ...categories.map((category) => ({
                            value: category.id.toString(),
                            label: category.name,
                          })),
                        ]}
                        value={filters.category}
                        onChange={(value) =>
                          setFilters({ ...filters, category: value })
                        }
                        placeholder="All Categories"
                        className="w-full"
                        disabled={loadingOptions}
                        id="category"
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-8 sm:mt-10 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full sm:col-start-2"
                    onClick={applyFilters}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-3 w-full sm:mt-0 sm:col-start-1"
                    onClick={() => setShowFilterModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tender Details Modal */}
        {showDetailsModal && selectedTender && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Tender Details
                      </h3>

                      {/* Tender Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedTender.title}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Procurement Number
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedTender.procurement_number || "N/A"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Contracting Authority
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedTender.contracting_authority_name ||
                              "Unknown"}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Type of Notice
                          </label>
                          <p className="mt-1">
                            <Badge
                              variant={
                                selectedTender.notice_type_name?.includes(
                                  "Award"
                                )
                                  ? "success"
                                  : "primary"
                              }
                              size="sm"
                            >
                              {selectedTender.notice_type_name ||
                                "Unknown Type"}
                            </Badge>
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Publication Date
                          </label>
                          <p className="mt-1 text-sm text-gray-900">
                            {formatDate(selectedTender.publication_date)}
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            End Date
                          </label>
                          <p
                            className={`mt-1 text-sm ${
                              tendersService.isTenderExpired(selectedTender)
                                ? "text-red-600 font-medium"
                                : "text-gray-900"
                            }`}
                          >
                            {formatDate(selectedTender.expiry_date)}
                          </p>
                        </div>

                        {selectedTender.cmimi && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Estimated Value
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedTender.cmimi}
                            </p>
                          </div>
                        )}

                        {selectedTender.email && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Contact Email
                            </label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedTender.email}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {selectedTender.description && (
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                            {selectedTender.description}
                          </p>
                        </div>
                      )}

                      {/* Documents Section */}
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-3">
                          Documents
                        </h4>
                        {(() => {
                          const documents =
                            tendersService.getTenderDocuments(selectedTender);
                          if (documents.length === 0) {
                            return (
                              <p className="text-sm text-gray-500">
                                No documents available for this tender.
                              </p>
                            );
                          }
                          return (
                            <ul className="divide-y divide-gray-200">
                              {documents.map((doc, index) => (
                                <li
                                  key={index}
                                  className="py-3 flex justify-between items-center"
                                >
                                  <div className="flex items-center">
                                    <FileIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {doc.name}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        {doc.field
                                          .replace("_", " ")
                                          .toUpperCase()}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={<DownloadIcon className="h-4 w-4" />}
                                    onClick={() => handleDownloadDocument(doc)}
                                  >
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
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Tender Modal */}
        {showEditModal && editTender && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-y-auto shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh]">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Edit Tender
                      </h3>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                          {/* Link */}
                          <div className="sm:col-span-6">
                            <FormInput 
                              label="Link" 
                              value={editTender.link || ""} 
                              onChange={e => handleEditFormChange('link', e.target.value)} 
                              placeholder="Enter tender link/URL" 
                            />
                          </div>

                          {/* Title */}
                          <div className="sm:col-span-4">
                            <FormInput 
                              label="Title" 
                              value={editTender.title || ""} 
                              onChange={e => handleEditFormChange('title', e.target.value)} 
                              placeholder="Enter tender title" 
                              required
                            />
                          </div>

                          {/* Procurement Number */}
                          <div className="sm:col-span-2">
                            <FormInput 
                              label="Procurement Number" 
                              value={editTender.procurement_number || ""} 
                              onChange={e => handleEditFormChange('procurement_number', e.target.value)} 
                              placeholder="Enter procurement number" 
                            />
                          </div>

                          {/* Contracting Authority */}
                          <div className="sm:col-span-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contracting Authority
                              </label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {editSelectedAuthorities.map((authority, index) => (
                                  <Badge key={index} variant="primary" size="sm">
                                    {authority}
                                  </Badge>
                                ))}
                              </div>
                              <MultiSelectDropdown
                                id="edit-authority"
                                label=""
                                options={editAuthorityOptions}
                                value={editSelectedAuthorityIds}
                                onChange={handleEditAuthorityChange}
                                placeholder="Search for authorities..."
                              />
                            </div>
                          </div>

                          {/* Category */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-category"
                              label="Category"
                              options={editCategoryOptions}
                              value={editTender.categoryId || ""}
                              onChange={handleEditCategoryChange}
                              placeholder="Search for a category..."
                            />
                          </div>

                          {/* Sub-Category */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-subCategory"
                              label="Sub-Category"
                              options={editSubCategoryOptions}
                              value={editTender.subCategory || ""}
                              onChange={value => handleEditFormChange('subCategory', value)}
                              disabled={!editTender.categoryId}
                              placeholder={editTender.categoryId ? 'Select a subcategory...' : 'Select a category first'}
                            />
                          </div>

                          {/* Contract Type */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-contractType"
                              label="Contract Type"
                              options={editContractTypeOptions}
                              value={editTender.contractTypeId || ""}
                              onChange={value => {
                                const selectedContractType = contractTypes.find((ct: any) => ct.id == value);
                                handleEditFormChange('contractTypeId', value);
                                handleEditFormChange('contract_type_name', selectedContractType?.name || '');
                              }}
                              placeholder="Search for a contract type..."
                            />
                          </div>

                          {/* Procedure */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-procedure"
                              label="Procedure"
                              options={editProcedureOptions}
                              value={editTender.procedureId || ""}
                              onChange={value => {
                                const selectedProcedure = procedures.find((proc: any) => proc.id == value);
                                handleEditFormChange('procedureId', value);
                                handleEditFormChange('procedure_name', selectedProcedure?.name || '');
                              }}
                              placeholder="Search for a procedure..."
                            />
                          </div>

                          {/* Notification Type */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-noticeType"
                              label="Notification Type"
                              options={editNoticeTypeOptions}
                              value={editTender.noticeTypeId || ""}
                              onChange={value => {
                                const selectedNoticeType = noticeTypes.find((nt: any) => nt.id == value);
                                handleEditFormChange('noticeTypeId', value);
                                handleEditFormChange('notice_type_name', selectedNoticeType?.notice || selectedNoticeType?.name || '');
                              }}
                              placeholder="Search for a notification type..."
                            />
                          </div>

                          {/* Country */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-country"
                              label="Country"
                              options={editCountryOptions}
                              value={editTender.countryId || ""}
                              onChange={value => {
                                const selectedCountry = countries.find((country: any) => country.id == value);
                                handleEditFormChange('countryId', value);
                                handleEditFormChange('country_name', selectedCountry?.name || '');
                              }}
                              placeholder="Search for a country..."
                            />
                          </div>

                          {/* Region */}
                          <div className="sm:col-span-3">
                            <SearchableDropdown
                              id="edit-region"
                              label="Region"
                              options={editRegionOptions}
                              value={editTender.regionId || ""}
                              onChange={value => {
                                const selectedRegion = regions.find((region: any) => region.id == value);
                                handleEditFormChange('regionId', value);
                                handleEditFormChange('region_name', selectedRegion?.name || '');
                              }}
                              placeholder="Search for a region..."
                            />
                          </div>

                          {/* Publication Date */}
                          <div className="sm:col-span-3">
                            <FormInput
                              id="edit-publication-date"
                              label="Publication Date"
                              type="date"
                              value={editTender.publication_date ? new Date(editTender.publication_date).toISOString().split('T')[0] : ""}
                              onChange={e => handleEditFormChange('publication_date', e.target.value)}
                            />
                          </div>

                          {/* End Date */}
                          <div className="sm:col-span-3">
                            <FormInput
                              id="edit-expiry-date"
                              label="End Date"
                              type="date"
                              value={editTender.expiry_date ? new Date(editTender.expiry_date).toISOString().split('T')[0] : ""}
                              onChange={e => handleEditFormChange('expiry_date', e.target.value)}
                            />
                          </div>

                          {/* Email */}
                          <div className="sm:col-span-3">
                            <FormInput 
                              label="Email" 
                              type="email"
                              value={editTender.email || ""} 
                              onChange={e => handleEditFormChange('email', e.target.value)} 
                              placeholder="Enter email address" 
                            />
                          </div>

                          {/* Price */}
                          <div className="sm:col-span-3">
                            <FormInput 
                              label="Price" 
                              prefix="€"
                              value={editTender.cmimi?.toString() || ""} 
                              onChange={e => handleEditFormChange('cmimi', e.target.value)} 
                              placeholder="0.00" 
                            />
                          </div>

                          {/* Re-tender Checkbox */}
                          <div className="sm:col-span-6">
                            <div className="flex items-center">
                              <input
                                id="edit-retendering"
                                type="checkbox"
                                checked={editTender.retendering || false}
                                onChange={e => handleEditFormChange('retendering', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label htmlFor="edit-retendering" className="ml-2 block text-sm font-medium text-gray-700">
                                Re-tender
                              </label>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="sm:col-span-6">
                            <FormTextarea 
                              label="Description" 
                              rows={4} 
                              value={editTender.description || ""} 
                              onChange={e => handleEditFormChange('description', e.target.value)} 
                              placeholder="Enter tender description" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    variant="primary"
                    onClick={handleSaveEdit}
                    disabled={editLoading}
                    className="ml-3"
                  >
                    {editLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditTender(null);
                    }}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && tenderToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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
                      Delete Tender
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{tenderToDelete.title}
                        "? This action cannot be undone.
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
                    disabled={deleteLoading}
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
