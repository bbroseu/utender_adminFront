import React, { useState, useEffect } from "react";
import { Table } from "../../ui/Table";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import {
  SearchIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  FileTextIcon,
  XIcon,
} from "lucide-react";
import tendersService, {
  Tender,
  TendersResponse,
} from "../../../services/tendersService";
import contractingAuthoritiesService, {
  ContractingAuthority,
} from "../../../services/contractingAuthoritiesService";
import noticeTypesService, {
  NoticeType,
} from "../../../services/noticeTypesService";
import { useToast, ToastContainer } from "../../ui/Toast";

interface AdminTendersProps {
  adminName: string; // 'qendrimi', 'tina', 'blini'
}

interface TenderDetailsModalProps {
  tender: Tender | null;
  isOpen: boolean;
  onClose: () => void;
  contractingAuthorities: ContractingAuthority[];
  noticeTypes: NoticeType[];
}

interface TenderEditModalProps {
  tender: Tender | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTender: Partial<Tender>) => void;
  contractingAuthorities: ContractingAuthority[];
  noticeTypes: NoticeType[];
}

function TenderDetailsModal({
  tender,
  isOpen,
  onClose,
  contractingAuthorities,
  noticeTypes,
}: TenderDetailsModalProps) {
  if (!isOpen || !tender) return null;

  // Helper functions to get names by ID
  const getContractingAuthorityName = (id: number | undefined): string => {
    if (!id) return "N/A";
    const authority = contractingAuthorities.find((auth) => auth.id === id);
    return authority?.name || `Unknown Authority (ID: ${id})`;
  };

  const getNoticeTypeName = (id: number | undefined): string => {
    if (!id) return "N/A";
    const noticeType = noticeTypes.find((type) => type.id === id);
    return noticeType?.name || noticeType?.notice || `Unknown Type (ID: ${id})`;
  };

  const formatDate = (dateString: string | number | undefined): string => {
    if (!dateString) return "N/A";
    const date =
      typeof dateString === "number"
        ? new Date(dateString * 1000)
        : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDocuments = () => {
    return tendersService.getTenderDocuments(tender);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Tender Details
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-2 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Basic Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Title:</strong> {tender.title || "N/A"}
                        </div>
                        <div>
                          <strong>Procurement Number:</strong>{" "}
                          {tender.procurement_number || "N/A"}
                        </div>
                        <div>
                          <strong>Publication Date:</strong>{" "}
                          {formatDate(tender.publication_date)}
                        </div>
                        <div>
                          <strong>Completion Date:</strong>{" "}
                          {formatDate(tender.expiry_date)}
                        </div>
                        <div>
                          <strong>Created By:</strong>{" "}
                          {tender.created_by || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Additional Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Contracting Authority:</strong>{" "}
                          {tender.contracting_authority_name}
                        </div>
                        <div>
                          <strong>Notice Type:</strong>{" "}
                          {(tender.notice_type_name &&
                            tender.notice_type_name !== null) ||
                            tender.notice_type?.notice ||
                            getNoticeTypeName(tender.notice_type_id)}
                        </div>
                        <div>
                          <strong>Category:</strong> {tender.category_name}
                        </div>
                        <div>
                          <strong>Region:</strong> {tender.state_name}
                        </div>
                        {tender.cmimi && (
                          <div>
                            <strong>Price:</strong> {tender.cmimi}
                          </div>
                        )}
                        {tender.email && (
                          <div>
                            <strong>Email:</strong> {tender.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {tender.description && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {tender.description}
                      </p>
                    </div>
                  )}

                  {/* Documents */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Documents
                    </h4>
                    {getDocuments().length > 0 ? (
                      <div className="bg-gray-50 rounded-md p-3">
                        <ul className="space-y-2">
                          {getDocuments().map((doc, index) => (
                            <li
                              key={index}
                              className="flex items-center justify-between py-2 px-3 bg-white rounded border"
                            >
                              <div className="flex items-center">
                                <FileTextIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">
                                  {doc.name}
                                </span>
                              </div>
                              <a
                                href={doc.url}
                                download={doc.name}
                                className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 bg-transparent border border-transparent rounded-md hover:bg-blue-50"
                              >
                                Download
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-md">
                        No documents available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenderEditModal({
  tender,
  isOpen,
  onClose,
  onSave,
  contractingAuthorities,
  noticeTypes,
}: TenderEditModalProps) {
  const [formData, setFormData] = useState<Partial<Tender>>({});

  // Initialize form data when tender changes
  useEffect(() => {
    if (tender && isOpen) {
      setFormData({
        title: tender.title || "",
        procurement_number: tender.procurement_number || "",
        description: tender.description || "",
        contracting_authority_id: tender.contracting_authority_id,
        notice_type_id: tender.notice_type_id,
        category_id: tender.category_id,
        region_id: tender.region_id,
        contract_type_id: tender.contract_type_id,
        procedures_id: tender.procedures_id,
        cmimi: tender.cmimi,
        email: tender.email || "",
        publication_date: tender.publication_date,
        expiry_date: tender.expiry_date,
      });
    }
  }, [tender, isOpen]);

  const handleInputChange = (field: keyof Tender, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen || !tender) return null;

  const formatDateForInput = (
    dateValue: string | number | undefined
  ): string => {
    if (!dateValue) return "";
    const date =
      typeof dateValue === "number"
        ? new Date(dateValue * 1000)
        : new Date(dateValue);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Edit Tender
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title || ""}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Procurement Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Procurement Number
                      </label>
                      <input
                        type="text"
                        value={formData.procurement_number || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "procurement_number",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Publication Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Publication Date
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.publication_date)}
                        onChange={(e) => {
                          const timestamp =
                            new Date(e.target.value).getTime() / 1000;
                          handleInputChange("publication_date", timestamp);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.expiry_date)}
                        onChange={(e) => {
                          const timestamp =
                            new Date(e.target.value).getTime() / 1000;
                          handleInputChange("expiry_date", timestamp);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.cmimi || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "cmimi",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Contracting Authority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contracting Authority
                      </label>
                      <select
                        value={formData.contracting_authority_id || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "contracting_authority_id",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Authority</option>
                        {contractingAuthorities.map((auth) => (
                          <option key={auth.id} value={auth.id}>
                            {auth.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notice Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notice Type
                      </label>
                      <select
                        value={formData.notice_type_id || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "notice_type_id",
                            parseInt(e.target.value) || undefined
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Notice Type</option>
                        {noticeTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name || type.notice}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description || ""}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" variant="primary" className="ml-3">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AdminTenders({ adminName }: AdminTendersProps) {
  const { toasts, removeToast, success, error } = useToast();

  // State management
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Lookup data for names
  const [contractingAuthorities, setContractingAuthorities] = useState<
    ContractingAuthority[]
  >([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeType[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load lookup data once on component mount
  useEffect(() => {
    loadLookupData();
  }, []);

  // Load tenders for the specific admin
  useEffect(() => {
    loadTenders();
  }, [adminName, currentPage, searchQuery]);

  const loadLookupData = async () => {
    try {
      const [authoritiesData, noticeTypesData] = await Promise.all([
        contractingAuthoritiesService.getAll(),
        noticeTypesService.getAll(),
      ]);
      setContractingAuthorities(authoritiesData);
      setNoticeTypes(noticeTypesData);
    } catch (err) {
      console.error("Error loading lookup data:", err);
      // Continue loading tenders even if lookup data fails
    }
  };

  const loadTenders = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
      };

      const response: TendersResponse = await tendersService.getByCreatedBy(
        adminName,
        params
      );

      console.log(`Tenders API Response for ${adminName}:`, response);
      console.log(
        `Setting totalItems: ${response.total || 0}, totalPages: ${
          response.totalPages || 0
        }, data length: ${(response.data || []).length}`
      );

      setTenders(response.data || []);
      setTotalItems(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } catch (err: any) {
      console.error(`Error loading tenders for ${adminName}:`, err);
      setApiError(err.message || "Failed to load tenders");
      error("Failed to load tenders", err.message || "Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get names by ID
  const getContractingAuthorityName = (id: number | undefined): string => {
    if (!id) return "N/A";
    const authority = contractingAuthorities.find((auth) => auth.id === id);
    return authority?.name || `Unknown Authority (ID: ${id})`;
  };

  const getNoticeTypeName = (id: number | undefined): string => {
    if (!id) return "N/A";
    const noticeType = noticeTypes.find((type) => type.id === id);
    return noticeType?.name || noticeType?.notice || `Unknown Type (ID: ${id})`;
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewDetails = (tender: Tender) => {
    setSelectedTender(tender);
    setShowDetailsModal(true);
  };

  const handleEdit = (tender: Tender) => {
    setSelectedTender(tender);
    setShowEditModal(true);
  };

  const handleSaveTender = async (updatedTender: Partial<Tender>) => {
    if (!selectedTender) return;

    try {
      await tendersService.updateTender(selectedTender.id, updatedTender);
      success("Tender Updated", "Tender has been updated successfully");
      setShowEditModal(false);
      setSelectedTender(null);
      loadTenders(); // Reload the list to show updated data
    } catch (err: any) {
      error("Update Failed", err.message || "Could not update the tender");
    }
  };

  const handleDelete = async (tender: Tender) => {
    if (window.confirm(`Are you sure you want to delete "${tender.title}"?`)) {
      try {
        await tendersService.deleteTender(tender.id);
        success("Tender Deleted", "Tender has been deleted successfully");
        loadTenders(); // Reload the list
      } catch (err: any) {
        error("Failed to Delete", err.message || "Could not delete the tender");
      }
    }
  };

  const formatDate = (dateString: string | number | undefined): string => {
    if (!dateString) return "N/A";
    const date =
      typeof dateString === "number"
        ? new Date(dateString * 1000)
        : new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getNoticeTypeBadgeColor = (
    noticeType: string | undefined
  ):
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "destructive" => {
    if (!noticeType) return "default";

    const type = noticeType.toLowerCase();
    if (type.includes("award")) return "success";
    if (type.includes("contract")) return "primary";
    if (type.includes("prior")) return "warning";
    return "default";
  };

  const columns = [
    {
      header: "Title",
      accessor: "title",
      render: (row: Tender) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate" title={row.title}>
            {row.title || "N/A"}
          </div>
          {row.procurement_number && (
            <div className="text-xs text-gray-500">
              {row.procurement_number}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Contracting Authority",
      accessor: "contracting_authority",
      render: (row: Tender) => (
        <div className="text-sm text-gray-900">
          {/* {(row.contracting_authority_name && row.contracting_authority_name !== null) ||
            row.contracting_authority?.name ||
            getContractingAuthorityName(row.contracting_authority_id)} */}
          {row.contracting_authority_name}
        </div>
      ),
    },
    {
      header: "Type of Announcement",
      accessor: "notice_type",
      render: (row: Tender) => {
        const noticeTypeName =
          (row.notice_type_name && row.notice_type_name !== null) ||
          row.notice_type?.notice ||
          getNoticeTypeName(row.notice_type_id);

        return (
          <Badge variant={getNoticeTypeBadgeColor(noticeTypeName)} size="sm">
            {noticeTypeName}
          </Badge>
        );
      },
    },
    {
      header: "Publication Date",
      accessor: "publication_date",
      render: (row: Tender) => (
        <div className="text-sm text-gray-900">
          {formatDate(row.publication_date)}
        </div>
      ),
    },
    {
      header: "Completion Date",
      accessor: "expiry_date",
      render: (row: Tender) => {
        const isExpired =
          row.expiry_date &&
          new Date(
            typeof row.expiry_date === "number"
              ? row.expiry_date * 1000
              : row.expiry_date
          ) < new Date();

        return (
          <div
            className={`text-sm font-medium ${
              isExpired ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatDate(row.expiry_date)}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row: Tender) => (
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            icon={<EyeIcon className="h-4 w-4" />}
            onClick={() => handleViewDetails(row)}
            aria-label="View Details"
            title="View Details"
            className="text-blue-600 hover:text-blue-800"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<EditIcon className="h-4 w-4" />}
            onClick={() => handleEdit(row)}
            aria-label="Edit"
            title="Edit"
            className="text-green-600 hover:text-green-800"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<TrashIcon className="h-4 w-4" />}
            onClick={() => handleDelete(row)}
            aria-label="Delete"
            title="Delete"
            className="text-red-600 hover:text-red-800"
          />
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Error state
  if (apiError) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{apiError}</div>
            <Button onClick={loadTenders} variant="primary">
              Retry
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 capitalize">
            {adminName}'s Tenders
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and view tenders created by {adminName}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
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
                  placeholder="Search tenders..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{totalItems}</span> tenders found
              </div>
            </div>
          </div>

          <Table columns={columns} data={tenders} />

          {/* Pagination */}
          {(totalItems > itemsPerPage || totalPages > 1) && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}-
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span>
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Previous</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

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
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-2 py-1 border text-xs font-medium ${
                            pageNumber === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={handleNext}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">Next</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tender Details Modal */}
        <TenderDetailsModal
          tender={selectedTender}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          contractingAuthorities={contractingAuthorities}
          noticeTypes={noticeTypes}
        />

        {/* Tender Edit Modal */}
        <TenderEditModal
          tender={selectedTender}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTender(null);
          }}
          onSave={handleSaveTender}
          contractingAuthorities={contractingAuthorities}
          noticeTypes={noticeTypes}
        />
      </div>
    </>
  );
}
