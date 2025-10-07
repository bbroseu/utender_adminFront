import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { FormInput } from "../../ui/FormInput";
import { SearchableDropdown } from "../../ui/SearchableDropdown";
import { MultiSelectDropdown } from "../../ui/MultiSelectDropdown";
import { DatePicker } from "../../ui/DatePicker";
import { FormTextarea } from "../../ui/FormTextarea";
import { Badge } from "../../ui/Badge";
import { SaveIcon, ArrowLeftIcon } from "lucide-react";
import tendersService, { Tender } from "../../../services/tendersService";
import { useToast, ToastContainer } from "../../ui/Toast";
import api from "../../../lib/api";
import { API_ENDPOINTS } from "../../../store/api/endpoints";

export function EditTender() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Dropdown data states
  const [contractingAuthorities, setContractingAuthorities] = useState([]);
  const [noticeTypes, setNoticeTypes] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedAuthorities, setSelectedAuthorities] = useState([]);
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Sample subcategories data (same as AddTender)
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

  const [formData, setFormData] = useState({
    link: "",
    title: "",
    procurement_number: "",
    category: "",
    categoryId: "",
    subCategory: "",
    contractType: "",
    contractTypeId: "",
    procedure: "",
    procedureId: "",
    noticeType: "",
    noticeTypeId: "",
    country: "",
    countryId: "",
    region: "",
    regionId: "",
    publication_date: "",
    expiry_date: "",
    email: "",
    cmimi: "",
    retendering: false,
    description: ""
  });

  // Load dropdown data on component mount
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        // Load contracting authorities
        const authoritiesResponse = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_ALL);
        const authorities = authoritiesResponse.data.success ? authoritiesResponse.data.data : authoritiesResponse.data;
        setContractingAuthorities(Array.isArray(authorities) ? authorities : []);

        // Load notice types
        const noticeTypesResponse = await fetch('https://api.utender.eu/api/notice-types');
        const noticeTypesData = await noticeTypesResponse.json();
        const noticeTypes = noticeTypesData.success ? noticeTypesData.data : noticeTypesData;
        setNoticeTypes(Array.isArray(noticeTypes) ? noticeTypes : []);

        // Load procedures
        const proceduresResponse = await fetch('https://api.utender.eu/api/procedures');
        const proceduresData = await proceduresResponse.json();
        const procedures = proceduresData.success ? proceduresData.data : proceduresData;
        setProcedures(Array.isArray(procedures) ? procedures : []);

        // Load contract types
        const contractTypesResponse = await fetch('https://api.utender.eu/api/contract-types');
        const contractTypesData = await contractTypesResponse.json();
        const contractTypes = contractTypesData.success ? contractTypesData.data : contractTypesData;
        setContractTypes(Array.isArray(contractTypes) ? contractTypes : []);

        // Load categories
        const categoriesResponse = await fetch('https://api.utender.eu/api/categories');
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.success ? categoriesData.data : categoriesData;
        setCategories(Array.isArray(categories) ? categories : []);

        // Load countries/states
        const countriesResponse = await api.get('/states');
        const countriesData = countriesResponse.data;
        const countries = countriesData.success ? countriesData.data : countriesData;
        setCountries(Array.isArray(countries) ? countries : []);

        // Load regions
        const regionsResponse = await api.get('/regions');
        const regionsData = regionsResponse.data;
        const regions = regionsData.success ? regionsData.data : regionsData;
        setRegions(Array.isArray(regions) ? regions : []);
      } catch (error) {
        console.error('Error loading dropdown data:', error);
        showError('Error', 'Failed to load dropdown data');
      }
    };

    loadDropdownData();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const filteredSubCategories = allSubCategories.filter(sc => sc.parentCategory === formData.category);
      setSubCategories(filteredSubCategories);
      // Clear subcategory selection if the current selection doesn't belong to the new category
      const currentSubCategoryExists = filteredSubCategories.some(sc => sc.name === formData.subCategory);
      if (!currentSubCategoryExists) {
        setFormData(prev => ({
          ...prev,
          subCategory: ''
        }));
      }
    } else {
      setSubCategories([]);
      setFormData(prev => ({
        ...prev,
        subCategory: ''
      }));
    }
  }, [formData.category]);

  // Load tender data on component mount
  useEffect(() => {
    if (id) {
      loadTender();
    }
  }, [id]);

  const loadTender = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const tenderData = await tendersService.getById(parseInt(id));
      setTender(tenderData);

      // Helper function to safely format date from timestamp
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return "";

        try {
          let date: Date;

          // If it's a number (timestamp in seconds), convert to milliseconds
          if (typeof dateValue === "number") {
            // Backend stores timestamps in seconds, JavaScript expects milliseconds
            date = new Date(dateValue * 1000);
          }
          // If it's already a Date object
          else if (dateValue instanceof Date) {
            date = dateValue;
          }
          // If it's a string, try to parse it
          else if (typeof dateValue === "string") {
            // If it already looks like YYYY-MM-DD, return as is
            if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return dateValue;
            }
            date = new Date(dateValue);
          } else {
            return "";
          }

          // Check if date is valid and return formatted
          if (!isNaN(date.getTime())) {
            return date.toISOString().split("T")[0];
          }

          return "";
        } catch (error) {
          console.warn("Error formatting date:", dateValue, error);
          return "";
        }
      };

      // Helper function to find names by IDs
      const findCategoryName = (categoryId: any) => {
        if (!categoryId) return '';
        const category = categories.find((cat: any) => cat.id == categoryId);
        return category?.name || '';
      };

      const findContractTypeName = (contractTypeId: any) => {
        if (!contractTypeId) return '';
        const contractType = contractTypes.find((ct: any) => ct.id == contractTypeId);
        return contractType?.name || '';
      };

      const findProcedureName = (procedureId: any) => {
        if (!procedureId) return '';
        const procedure = procedures.find((proc: any) => proc.id == procedureId);
        return procedure?.name || '';
      };

      const findNoticeTypeName = (noticeTypeId: any) => {
        if (!noticeTypeId) return '';
        const noticeType = noticeTypes.find((nt: any) => nt.id == noticeTypeId);
        return noticeType?.name || noticeType?.notice || noticeType?.type || '';
      };

      const findCountryName = (countryId: any) => {
        if (!countryId) return '';
        const country = countries.find((c: any) => c.id == countryId);
        return country?.name || '';
      };

      const findRegionName = (regionId: any) => {
        if (!regionId) return '';
        const region = regions.find((r: any) => r.id == regionId);
        return region?.name || '';
      };

      const findAuthorityName = (authorityId: any) => {
        if (!authorityId) return '';
        const authority = contractingAuthorities.find((auth: any) => auth.id == authorityId);
        return authority?.name || '';
      };

      // Populate form with tender data
      setFormData({
        link: tenderData.link || "",
        title: tenderData.title || "",
        procurement_number: tenderData.procurement_number || "",
        category: findCategoryName(tenderData.category_id),
        categoryId: tenderData.category_id || "",
        subCategory: "", // Will be handled by subcategory effect
        contractType: findContractTypeName(tenderData.contract_type_id),
        contractTypeId: tenderData.contract_type_id || "",
        procedure: findProcedureName(tenderData.procedures_id),
        procedureId: tenderData.procedures_id || "",
        noticeType: findNoticeTypeName(tenderData.notice_type_id),
        noticeTypeId: tenderData.notice_type_id || "",
        country: findCountryName(tenderData.states_id),
        countryId: tenderData.states_id || "",
        region: findRegionName(tenderData.region_id),
        regionId: tenderData.region_id || "",
        publication_date: formatDate(tenderData.publication_date),
        expiry_date: formatDate(tenderData.expiry_date),
        email: tenderData.email || "",
        cmimi: tenderData.cmimi ? tenderData.cmimi.toString() : "",
        retendering: Boolean(tenderData.retendering),
        description: tenderData.description || "",
      });

      // Set authorities
      if (tenderData.contracting_authority_id) {
        const authorityName = findAuthorityName(tenderData.contracting_authority_id);
        if (authorityName) {
          setSelectedAuthorities([authorityName]);
          setSelectedAuthorityIds([tenderData.contracting_authority_id]);
        }
      }
    } catch (err: any) {
      console.error("Error loading tender:", err);
      showError(
        "Failed to load tender",
        err.message || "Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form value changes for dropdowns
  const handleFormValueChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle authority selection
  const handleAuthorityChange = (values: any[]) => {
    const authorityNames = values.map(id => {
      const authority = contractingAuthorities.find((auth: any) => auth.id == id);
      return authority?.name || '';
    }).filter(name => name);
    
    setSelectedAuthorityIds(values);
    setSelectedAuthorities(authorityNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tender) return;

    try {
      setSaving(true);

      // Prepare update data - send exactly what the backend expects
      const updateData: any = {};

      // Basic fields
      if (formData.link) {
        updateData.link = formData.link;
      }

      if (formData.title) {
        updateData.title = formData.title;
      }

      if (formData.procurement_number) {
        updateData.procurement_number = formData.procurement_number;
      }

      if (formData.description) {
        updateData.description = formData.description;
      }

      if (formData.email) {
        updateData.email = formData.email;
      }

      // Dropdown IDs
      if (formData.categoryId) {
        updateData.category_id = formData.categoryId;
      }

      if (formData.contractTypeId) {
        updateData.contract_type_id = formData.contractTypeId;
      }

      if (formData.procedureId) {
        updateData.procedures_id = formData.procedureId;
      }

      if (formData.noticeTypeId) {
        updateData.notice_type_id = formData.noticeTypeId;
      }

      if (formData.countryId) {
        updateData.states_id = formData.countryId;
      }

      if (formData.regionId) {
        updateData.region_id = formData.regionId;
      }

      // Contracting Authority
      if (selectedAuthorityIds.length > 0) {
        updateData.contracting_authority_id = selectedAuthorityIds[0];
      }

      // Send dates as timestamps (integers) if they exist
      if (formData.publication_date) {
        updateData.publication_date = Math.floor(
          new Date(formData.publication_date).getTime() / 1000
        );
      }

      if (formData.expiry_date) {
        updateData.expiry_date = Math.floor(
          new Date(formData.expiry_date).getTime() / 1000
        );
      }

      // Backend treats cmimi as text field and calls .trim() on it
      // So send as string, not number
      if (formData.cmimi) {
        updateData.cmimi = formData.cmimi.toString();
      }

      // Re-tendering
      updateData.retendering = formData.retendering ? 1 : 0;

      console.log("Sending update data:", updateData);

      await tendersService.updateTender(tender.id, updateData);

      success("Tender Updated", "Tender has been successfully updated.");

      // Navigate back to panel after short delay
      setTimeout(() => {
        navigate("/panel");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating tender:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to update tender";
      showError("Update Failed", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/panel");
  };

  // Generate dropdown options
  const authorityOptions = contractingAuthorities.map((authority: any) => ({
    value: authority.id,
    label: authority.name
  }));

  const noticeTypeOptions = [
    { value: '', label: 'Select a type' },
    ...noticeTypes.map((noticeType: any) => ({
      value: noticeType.id,
      label: noticeType.name || noticeType.notice || noticeType.type
    }))
  ];

  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...categories.map((category: any) => ({
      value: category.id,
      label: category.name
    }))
  ];

  const subCategoryOptions = [
    { value: '', label: 'Select a subcategory' },
    ...subCategories.map((subCat: any) => ({
      value: subCat.name,
      label: subCat.name
    }))
  ];

  const procedureOptions = [
    { value: '', label: 'Select a procedure' },
    ...procedures.map((procedure: any) => ({
      value: procedure.id,
      label: procedure.name
    }))
  ];

  const contractTypeOptions = [
    { value: '', label: 'Select a contract type' },
    ...contractTypes.map((contractType: any) => ({
      value: contractType.id,
      label: contractType.name
    }))
  ];

  const countryOptions = [
    { value: '', label: 'Select a country' },
    ...countries.map((country: any) => ({
      value: country.id,
      label: country.name
    }))
  ];

  const regionOptions = [
    { value: '', label: 'Select a region' },
    ...regions.map((region: any) => ({
      value: region.id,
      label: region.name
    }))
  ];

  if (loading) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (!tender) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">Tender not found</div>
            <Button onClick={handleCancel} variant="primary">
              Go Back
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeftIcon className="h-4 w-4" />}
              onClick={handleCancel}
              className="mr-4"
            >
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Tender
            </h1>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                  {/* Link */}
                  <div className="sm:col-span-6">
                    <FormInput 
                      id="link" 
                      label="Link" 
                      value={formData.link} 
                      onChange={e => handleFormValueChange('link', e.target.value)} 
                      placeholder="Enter tender link/URL" 
                    />
                  </div>

                  {/* Title */}
                  <div className="sm:col-span-4">
                    <FormInput 
                      id="title" 
                      label="Title" 
                      value={formData.title} 
                      onChange={e => handleFormValueChange('title', e.target.value)} 
                      placeholder="Enter tender title" 
                      required
                    />
                  </div>

                  {/* Prosecution Number */}
                  <div className="sm:col-span-2">
                    <FormInput 
                      id="prosecution_number" 
                      label="Prosecution Number" 
                      value={formData.procurement_number} 
                      onChange={e => handleFormValueChange('procurement_number', e.target.value)} 
                      placeholder="Enter prosecution number" 
                    />
                  </div>

                  {/* Contracting Authority */}
                  <div className="sm:col-span-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contracting Authority
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {selectedAuthorities.map((authority, index) => (
                          <Badge key={index} variant="primary" size="md">
                            {authority}
                          </Badge>
                        ))}
                      </div>
                      <MultiSelectDropdown
                        id="authority"
                        label=""
                        options={authorityOptions}
                        value={selectedAuthorityIds}
                        onChange={handleAuthorityChange}
                        placeholder="Search for authorities..."
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="category"
                      label="Category"
                      options={categoryOptions}
                      value={formData.categoryId}
                      onChange={value => {
                        const selectedCategory = categories.find((cat: any) => cat.id == value);
                        handleFormValueChange('categoryId', value);
                        handleFormValueChange('category', selectedCategory?.name || '');
                      }}
                      placeholder="Search for a category..."
                    />
                  </div>

                  {/* Sub-Category */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="subCategory"
                      label="Sub-Category"
                      options={subCategoryOptions}
                      value={formData.subCategory}
                      onChange={value => handleFormValueChange('subCategory', value)}
                      disabled={!formData.category}
                      placeholder={formData.category ? 'Select a subcategory...' : 'Select a category first'}
                    />
                  </div>

                  {/* Contract Type */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="contractType"
                      label="Contract Type"
                      options={contractTypeOptions}
                      value={formData.contractTypeId}
                      onChange={value => {
                        const selectedContractType = contractTypes.find((ct: any) => ct.id == value);
                        handleFormValueChange('contractTypeId', value);
                        handleFormValueChange('contractType', selectedContractType?.name || '');
                      }}
                      placeholder="Search for a contract type..."
                    />
                  </div>

                  {/* Procedure */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="procedure"
                      label="Procedure"
                      options={procedureOptions}
                      value={formData.procedureId}
                      onChange={value => {
                        const selectedProcedure = procedures.find((proc: any) => proc.id == value);
                        handleFormValueChange('procedureId', value);
                        handleFormValueChange('procedure', selectedProcedure?.name || '');
                      }}
                      placeholder="Search for a procedure..."
                    />
                  </div>

                  {/* Notification Type */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="noticeType"
                      label="Notification Type"
                      options={noticeTypeOptions}
                      value={formData.noticeTypeId}
                      onChange={value => {
                        const selectedNoticeType = noticeTypes.find((nt: any) => nt.id == value);
                        handleFormValueChange('noticeTypeId', value);
                        handleFormValueChange('noticeType', selectedNoticeType?.name || selectedNoticeType?.notice || selectedNoticeType?.type || '');
                      }}
                      placeholder="Search for a notification type..."
                    />
                  </div>

                  {/* Country */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="country"
                      label="Country"
                      options={countryOptions}
                      value={formData.countryId}
                      onChange={value => {
                        const selectedCountry = countries.find((country: any) => country.id == value);
                        handleFormValueChange('countryId', value);
                        handleFormValueChange('country', selectedCountry?.name || '');
                      }}
                      placeholder="Search for a country..."
                    />
                  </div>

                  {/* Region */}
                  <div className="sm:col-span-3">
                    <SearchableDropdown
                      id="region"
                      label="Region"
                      options={regionOptions}
                      value={formData.regionId}
                      onChange={value => {
                        const selectedRegion = regions.find((region: any) => region.id == value);
                        handleFormValueChange('regionId', value);
                        handleFormValueChange('region', selectedRegion?.name || '');
                      }}
                      placeholder="Search for a region..."
                    />
                  </div>

                  {/* Publication Date */}
                  <div className="sm:col-span-3">
                    <FormInput
                      id="publication_date"
                      label="Publication Date"
                      type="date"
                      value={formData.publication_date}
                      onChange={e => handleFormValueChange('publication_date', e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div className="sm:col-span-3">
                    <FormInput
                      id="expiry_date"
                      label="End Date"
                      type="date"
                      value={formData.expiry_date}
                      onChange={e => handleFormValueChange('expiry_date', e.target.value)}
                    />
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-3">
                    <FormInput 
                      id="email" 
                      label="Email" 
                      type="email"
                      value={formData.email} 
                      onChange={e => handleFormValueChange('email', e.target.value)} 
                      placeholder="Enter email address" 
                    />
                  </div>

                  {/* Price */}
                  <div className="sm:col-span-3">
                    <FormInput 
                      id="cmimi" 
                      label="Price" 
                      prefix="€"
                      value={formData.cmimi} 
                      onChange={e => handleFormValueChange('cmimi', e.target.value)} 
                      placeholder="0.00" 
                    />
                  </div>

                  {/* Re-tender Checkbox */}
                  <div className="sm:col-span-6">
                    <div className="flex items-center">
                      <input
                        id="retendering"
                        type="checkbox"
                        checked={formData.retendering}
                        onChange={e => handleFormValueChange('retendering', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="retendering" className="ml-2 block text-sm font-medium text-gray-700">
                        Re-tender
                      </label>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-6">
                    <FormTextarea 
                      id="description" 
                      label="Description" 
                      rows={4} 
                      value={formData.description} 
                      onChange={e => handleFormValueChange('description', e.target.value)} 
                      placeholder="Enter tender description" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={saving}
                  icon={saving ? undefined : <SaveIcon className="h-4 w-4" />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
