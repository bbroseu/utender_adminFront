import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../store/slices/authSlice';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { FormInput } from '../../ui/FormInput';
import { SearchableDropdown } from '../../ui/SearchableDropdown';
import { MultiSelectDropdown } from '../../ui/MultiSelectDropdown';
import { DatePicker } from '../../ui/DatePicker';
import { FileUpload } from '../../ui/FileUpload';
import { FormTextarea } from '../../ui/FormTextarea';
import { Badge } from '../../ui/Badge';
import { SaveIcon, UploadIcon, FileTextIcon, CheckIcon, FileIcon, XIcon } from 'lucide-react';
import tenderService from '../../../services/tenderService';
import { useToast, ToastContainer } from '../../ui/Toast';
import api from '../../../lib/api';
import { API_ENDPOINTS } from '../../../store/api/endpoints';
export function AddTender() {
  const navigate = useNavigate();
  const { toasts, removeToast, success, error: showError } = useToast();
  const currentUser = useSelector(selectUser);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [document2, setDocument2] = useState([]);
  const [document3, setDocument3] = useState([]);
  const [document4, setDocument4] = useState([]);
  const [document5, setDocument5] = useState([]);
  const [requiredDocError, setRequiredDocError] = useState(false);
  const [selectedAuthorities, setSelectedAuthorities] = useState([]);
  const [selectedAuthorityIds, setSelectedAuthorityIds] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [contractingAuthorities, setContractingAuthorities] = useState([]);
  const [noticeTypes, setNoticeTypes] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [contractTypes, setContractTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState([]);
  const [formValues, setFormValues] = useState({
    link: '',
    title: '',
    prosecutionNumber: '',
    category: '',
    categoryId: '',
    subCategory: '',
    contractType: '',
    contractTypeId: '',
    procedure: '',
    procedureId: '',
    noticeType: '',
    noticeTypeId: '',
    country: '',
    countryId: '',
    region: '',
    regionId: '',
    publicationDate: null,
    endDate: null,
    email: '',
    price: '',
    retendering: false,
    description: ''
  });
  // Sample subcategories data
  const allSubCategories = [{
    id: 5,
    name: 'Software Development',
    parentCategory: 'IT Services',
    code: 'SOFT'
  }, {
    id: 6,
    name: 'Network Infrastructure',
    parentCategory: 'IT Services',
    code: 'NET'
  }, {
    id: 7,
    name: 'Residential Buildings',
    parentCategory: 'Construction',
    code: 'RES'
  }, {
    id: 8,
    name: 'Commercial Buildings',
    parentCategory: 'Construction',
    code: 'COM'
  }, {
    id: 9,
    name: 'Diagnostic Equipment',
    parentCategory: 'Medical Equipment',
    code: 'DIAG'
  }, {
    id: 10,
    name: 'Web Development',
    parentCategory: 'Software Development',
    code: 'WEB'
  }, {
    id: 11,
    name: 'Mobile Development',
    parentCategory: 'Software Development',
    code: 'MOB'
  }, {
    id: 12,
    name: 'Office Paper',
    parentCategory: 'Office Supplies',
    code: 'PAPER'
  }, {
    id: 13,
    name: 'Writing Instruments',
    parentCategory: 'Office Supplies',
    code: 'WRITE'
  }];
  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load contracting authorities
        const authoritiesResponse = await api.get(API_ENDPOINTS.CONTRACTING_AUTHORITIES.GET_ALL);
        const authorities = authoritiesResponse.data.success ? authoritiesResponse.data.data : authoritiesResponse.data;
        setContractingAuthorities(Array.isArray(authorities) ? authorities : []);

        // Load notice types from the specific API endpoint
        const noticeTypesResponse = await fetch('https://api.utender.eu/api/notice-types');
        const noticeTypesData = await noticeTypesResponse.json();
        const noticeTypes = noticeTypesData.success ? noticeTypesData.data : noticeTypesData;
        setNoticeTypes(Array.isArray(noticeTypes) ? noticeTypes : []);

        // Load procedures from the API endpoint
        const proceduresResponse = await fetch('https://api.utender.eu/api/procedures');
        const proceduresData = await proceduresResponse.json();
        const procedures = proceduresData.success ? proceduresData.data : proceduresData;
        setProcedures(Array.isArray(procedures) ? procedures : []);

        // Load contract types from the API endpoint
        const contractTypesResponse = await fetch('https://api.utender.eu/api/contract-types');
        const contractTypesData = await contractTypesResponse.json();
        const contractTypes = contractTypesData.success ? contractTypesData.data : contractTypesData;
        setContractTypes(Array.isArray(contractTypes) ? contractTypes : []);

        // Load categories from the API endpoint
        const categoriesResponse = await fetch('https://api.utender.eu/api/categories');
        const categoriesData = await categoriesResponse.json();
        const categories = categoriesData.success ? categoriesData.data : categoriesData;
        console.log('Categories loaded:', categories);
        setCategories(Array.isArray(categories) ? categories : []);

        // Load countries/states from the API endpoint
        const countriesResponse = await api.get('/states');
        const countriesData = countriesResponse.data;
        const countries = countriesData.success ? countriesData.data : countriesData;
        setCountries(Array.isArray(countries) ? countries : []);

        // Load regions from the API endpoint
        const regionsResponse = await api.get('/regions');
        const regionsData = regionsResponse.data;
        const regions = regionsData.success ? regionsData.data : regionsData;
        console.log('Regions loaded:', regions);
        setRegions(Array.isArray(regions) ? regions : []);
      } catch (error) {
        console.error('Error loading data:', error);
        showError('Error', 'Failed to load dropdown data');
      }
    };

    loadData();
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (formValues.category) {
      const filteredSubCategories = allSubCategories.filter(sc => sc.parentCategory === formValues.category);
      setSubCategories(filteredSubCategories);
      // Clear subcategory selection if the current selection doesn't belong to the new category
      const currentSubCategoryExists = filteredSubCategories.some(sc => sc.name === formValues.subCategory);
      if (!currentSubCategoryExists) {
        setFormValues(prev => ({
          ...prev,
          subCategory: ''
        }));
      }
    } else {
      setSubCategories([]);
      setFormValues(prev => ({
        ...prev,
        subCategory: ''
      }));
    }
  }, [formValues.category]);
  // Handle file upload and processing
  const handleFileUpload = async (files) => {
    if (files.length > 0) {
      setUploadedFiles(files);
      setIsLoading(true);
      
      try {
        // Process the uploaded document to extract tender information
        const extractedData = await tenderService.uploadAndProcessDocument(files[0]);
        
        setFormValues({
          link: extractedData.link || '',
          title: extractedData.title || 'Construction of administrative building in Pristina',
          prosecutionNumber: extractedData.prosecutionNumber || 'PRN-2023-001',
          category: extractedData.category || 'Construction',
          subCategory: extractedData.subCategory || 'Commercial Buildings',
          contractType: extractedData.contractType || 'Works',
          procedure: extractedData.procedure || 'Open',
          noticeType: extractedData.noticeType || 'Contract Notice',
          country: extractedData.country || 'Kosovo',
          region: extractedData.region || '',
          publicationDate: extractedData.publicationDate ? new Date(extractedData.publicationDate) : new Date('2023-05-10'),
          endDate: extractedData.endDate ? new Date(extractedData.endDate) : new Date('2023-06-10'),
          email: extractedData.email || '',
          price: extractedData.price || '5200000.00',
          retendering: extractedData.retendering || false,
          description: extractedData.description || 'Construction of a new administrative building in Pristina with 5 floors and underground parking.'
        });
        
        setSelectedAuthorities(extractedData.authorities || ['Ministry of Infrastructure']);
        setIsUploaded(true);
      } catch (error) {
        console.error('Error processing document:', error);
        // Fall back to manual entry with sample data
        setFormValues({
          link: '',
          title: 'Construction of administrative building in Pristina',
          prosecutionNumber: 'PRN-2023-001',
          category: 'Construction',
          subCategory: 'Commercial Buildings',
          contractType: 'Works',
          procedure: 'Open',
          noticeType: 'Contract Notice',
          country: 'Kosovo',
          region: '',
          publicationDate: new Date('2023-05-10'),
          endDate: new Date('2023-06-10'),
          email: '',
          price: '5200000.00',
          retendering: false,
          description: 'Construction of a new administrative building in Pristina with 5 floors and underground parking.'
        });
        setSelectedAuthorities(['Ministry of Infrastructure']);
        setIsUploaded(true);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Reset file upload
  const handleResetUpload = () => {
    setUploadedFiles([]);
    setIsUploaded(false);
    setShowUploadSection(false);
    setFormValues({
      link: '',
      title: '',
      prosecutionNumber: '',
      category: '',
      categoryId: '',
      subCategory: '',
      contractType: '',
      contractTypeId: '',
      procedure: '',
      procedureId: '',
      noticeType: '',
      noticeTypeId: '',
      country: '',
      countryId: '',
      region: '',
      regionId: '',
      publicationDate: null,
      endDate: null,
      email: '',
      price: '',
      retendering: false,
      description: ''
    });
    setSelectedAuthorities([]);
    setSelectedAuthorityIds([]);
  };
  // Handle document uploads
  const handleDocumentUpload = (files) => {
    setDocuments(files);
    setRequiredDocError(false);
  };

  const handleDocument2Upload = (files) => setDocument2(files);
  const handleDocument3Upload = (files) => setDocument3(files);
  const handleDocument4Upload = (files) => setDocument4(files);
  const handleDocument5Upload = (files) => setDocument5(files);
  // Handle form value changes
  const handleInputChange = (name, value) => {
    console.log(`Setting ${name} to:`, value);
    setFormValues(prev => {
      const updated = {
        ...prev,
        [name]: value
      };
      console.log('Updated form values:', updated);
      return updated;
    });
  };
  // Handle authority selection
  const handleAuthorityChange = (values) => {
    const authorityNames = values.map(id => {
      const authority = contractingAuthorities.find(auth => auth.id == id);
      return authority?.name || '';
    }).filter(name => name);
    
    setSelectedAuthorityIds(values);
    setSelectedAuthorities(authorityNames);
  };
  // Validate form before submission
  const validateForm = () => {
    if (documents.length === 0) {
      setRequiredDocError(true);
      return false;
    }
    setRequiredDocError(false);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError('');

    try {
      // Prepare all document files
      const allDocuments = [
        ...documents,
        ...document2,
        ...document3,
        ...document4,
        ...document5
      ].filter(doc => doc); // Remove empty arrays

      // Prepare tender data for submission (including file references)
      const tenderData = tenderService.formatTenderData(
        formValues, 
        selectedAuthorityIds, 
        allDocuments,
        currentUser
      );

      console.log('Form Values before submission:', formValues);
      console.log('Selected Authority IDs:', selectedAuthorityIds);
      console.log('Submitting tender data:', tenderData);

      // Create the tender
      const createdTender = await tenderService.createTender(tenderData);

      // Show success message
      console.log('Tender created successfully:', createdTender);
      
      // Show user-friendly success toast
      success(
        'Tender Created Successfully!',
        `"${formValues.title}" has been created successfully.`,
        6000
      );
      
      // Reset form
      handleResetUpload();
      setDocuments([]);
      setDocument2([]);
      setDocument3([]);
      setDocument4([]);
      setDocument5([]);
      
      // Navigate to notifications/all page
      navigate('/notifications/all');
      
    } catch (error) {
      console.error('Error creating tender:', error);
      const errorMessage = error.message || 'Failed to create tender. Please try again.';
      setSubmitError(errorMessage);
      showError('Error Creating Tender', errorMessage, 8000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle date changes
  const handleDateChange = (field, date) => {
    setFormValues({
      ...formValues,
      [field]: date
    });
  };
  // Authority options - generated from API data
  const authorityOptions = contractingAuthorities.map(authority => ({
    value: authority.id,
    label: authority.name
  }));
  // Notice type options - generated from API data
  const noticeTypeOptions = [
    {
      value: '',
      label: 'Select a type'
    },
    ...noticeTypes.map(noticeType => ({
      value: noticeType.id,
      label: noticeType.name || noticeType.notice || noticeType.type
    }))
  ];
  // Category options - generated from API data
  const categoryOptions = [
    {
      value: '',
      label: 'Select a category'
    },
    ...categories.map(category => ({
      value: category.id,
      label: category.name
    }))
  ];
  // Generate subcategory options
  const subCategoryOptions = [{
    value: '',
    label: 'Select a subcategory'
  }, ...subCategories.map(subCat => ({
    value: subCat.name,
    label: subCat.name
  }))];
  // Procedure options - generated from API data
  const procedureOptions = [
    {
      value: '',
      label: 'Select a procedure'
    },
    ...procedures.map(procedure => ({
      value: procedure.id,
      label: procedure.name
    }))
  ];
  // Contract type options - generated from API data
  const contractTypeOptions = [
    {
      value: '',
      label: 'Select a contract type'
    },
    ...contractTypes.map(contractType => ({
      value: contractType.id,
      label: contractType.name
    }))
  ];
  // Country options - generated from API data
  const countryOptions = [
    {
      value: '',
      label: 'Select a country'
    },
    ...countries.map(country => ({
      value: country.id,
      label: country.name
    }))
  ];

  // Region options - generated from API data
  const regionOptions = [
    {
      value: '',
      label: 'Select a region'
    },
    ...regions.map(region => ({
      value: region.id,
      label: region.name
    }))
  ];
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Tender</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload a document to auto-fill details or enter information manually
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <div className="text-center mb-6">
          <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            Upload Tender Document (Optional)
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Upload a Word document extracted from Eprokurimi to automatically
            fill the tender details
          </p>
        </div>

        {!isUploaded ? (
          <div className="text-center">
            <Button 
              type="button" 
              variant={showUploadSection ? "secondary" : "primary"}
              onClick={() => setShowUploadSection(!showUploadSection)}
              icon={<UploadIcon className="h-4 w-4" />}
            >
              {showUploadSection ? 'Hide Upload' : 'Show Upload'}
            </Button>
            
            {showUploadSection && (
              <div className="mt-6">
                <FileUpload
                  id="tender-upload"
                  accept=".doc,.docx"
                  files={uploadedFiles}
                  onFilesChange={handleFileUpload}
                  placeholder="Upload a file or drag and drop"
                  helpText="Word documents only (.doc, .docx)"
                  showPreview={false}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="mt-1 border-2 border-green-100 rounded-md bg-green-50 p-4">
            <div className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Document uploaded successfully
              </span>
            </div>
            <div className="mt-2 text-sm text-green-700">
              <p>File: {uploadedFiles[0]?.name}</p>
              <p className="mt-1">
                The tender details have been extracted and populated in the form
                below. Please review and confirm.
              </p>
            </div>
            <div className="mt-4">
              <Button type="button" variant="secondary" size="sm" onClick={handleResetUpload}>
                Upload a different file
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Manual Entry Form */}
      <Card>
        {submitError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}
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
                    value={formValues.link} 
                    onChange={e => handleInputChange('link', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="Enter tender link/URL" 
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-4">
                  <FormInput 
                    id="title" 
                    label="Title" 
                    value={formValues.title} 
                    onChange={e => handleInputChange('title', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="Enter tender title" 
                  />
                </div>

                {/* Prosecution Number */}
                <div className="sm:col-span-2">
                  <FormInput 
                    id="prosecutionNumber" 
                    label="Prosecution Number" 
                    value={formValues.prosecutionNumber} 
                    onChange={e => handleInputChange('prosecutionNumber', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="Enter prosecution number" 
                  />
                </div>

                {/* Contracting Authority */}
                <div className="sm:col-span-6">
                  {isUploaded ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contracting Authority
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedAuthorities.map((authority, index) => (
                          <Badge key={index} variant="primary" size="md">
                            {authority}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <MultiSelectDropdown
                      id="authority"
                      label="Contracting Authority"
                      options={authorityOptions}
                      value={selectedAuthorityIds}
                      onChange={handleAuthorityChange}
                      placeholder="Search for authorities..."
                    />
                  )}
                </div>

                {/* Category */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="category"
                    label="Category"
                    options={categoryOptions}
                    value={formValues.categoryId}
                    onChange={value => {
                      console.log('Category selected:', value, typeof value);
                      const selectedCategory = categories.find(cat => cat.id == value); // Use == instead of === for looser comparison
                      console.log('Selected category object:', selectedCategory);
                      handleInputChange('categoryId', value);
                      handleInputChange('category', selectedCategory?.name || '');
                    }}
                    disabled={isUploaded}
                    placeholder="Search for a category..."
                  />
                </div>

                {/* Sub-Category */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="subCategory"
                    label="Sub-Category"
                    options={subCategoryOptions}
                    value={formValues.subCategory}
                    onChange={value => handleInputChange('subCategory', value)}
                    disabled={isUploaded || !formValues.category}
                    placeholder={formValues.category ? 'Select a subcategory...' : 'Select a category first'}
                  />
                </div>

                {/* Contract Type */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="contractType"
                    label="Contract Type"
                    options={contractTypeOptions}
                    value={formValues.contractTypeId}
                    onChange={value => {
                      const selectedContractType = contractTypes.find(ct => ct.id == value);
                      handleInputChange('contractTypeId', value);
                      handleInputChange('contractType', selectedContractType?.name || '');
                    }}
                    disabled={isUploaded}
                    placeholder="Search for a contract type..."
                  />
                </div>

                {/* Procedure */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="procedure"
                    label="Procedure"
                    options={procedureOptions}
                    value={formValues.procedureId}
                    onChange={value => {
                      const selectedProcedure = procedures.find(proc => proc.id == value);
                      handleInputChange('procedureId', value);
                      handleInputChange('procedure', selectedProcedure?.name || '');
                    }}
                    disabled={isUploaded}
                    placeholder="Search for a procedure..."
                  />
                </div>

                {/* Notification Type */}
                <div className="sm:col-span-3">
                  {isUploaded ? (
                    <FormInput id="noticeType" label="Notification Type" value={formValues.noticeType} readOnly />
                  ) : (
                    <SearchableDropdown
                      id="noticeType"
                      label="Notification Type"
                      options={noticeTypeOptions}
                      value={formValues.noticeTypeId}
                      onChange={value => {
                        const selectedNoticeType = noticeTypes.find(nt => nt.id == value);
                        handleInputChange('noticeTypeId', value);
                        handleInputChange('noticeType', selectedNoticeType?.name || selectedNoticeType?.notice || selectedNoticeType?.type || '');
                      }}
                      placeholder="Search for a notification type..."
                    />
                  )}
                </div>

                {/* Country */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="country"
                    label="Country"
                    options={countryOptions}
                    value={formValues.countryId}
                    onChange={value => {
                      const selectedCountry = countries.find(country => country.id == value);
                      handleInputChange('countryId', value);
                      handleInputChange('country', selectedCountry?.name || '');
                    }}
                    disabled={isUploaded}
                    placeholder="Search for a country..."
                  />
                </div>

                {/* Region */}
                <div className="sm:col-span-3">
                  <SearchableDropdown
                    id="region"
                    label="Region"
                    options={regionOptions}
                    value={formValues.regionId}
                    onChange={value => {
                      const selectedRegion = regions.find(region => region.id == value);
                      handleInputChange('regionId', value);
                      handleInputChange('region', selectedRegion?.name || '');
                    }}
                    disabled={isUploaded}
                    placeholder="Search for a region..."
                  />
                </div>

                {/* Publication Date */}
                <div className="sm:col-span-3">
                  <DatePicker
                    id="publicationDate"
                    label="Publication Date"
                    value={formValues.publicationDate}
                    onChange={date => handleDateChange('publicationDate', date)}
                    readOnly={isUploaded}
                    placeholder="Select publication date"
                  />
                </div>

                {/* End Date */}
                <div className="sm:col-span-3">
                  <DatePicker
                    id="endDate"
                    label="End Date"
                    value={formValues.endDate}
                    onChange={date => handleDateChange('endDate', date)}
                    readOnly={isUploaded}
                    placeholder="Select end date"
                    minDate={formValues.publicationDate}
                  />
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <FormInput 
                    id="email" 
                    label="Email" 
                    type="email"
                    value={formValues.email} 
                    onChange={e => handleInputChange('email', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="Enter email address" 
                  />
                </div>

                {/* Price */}
                <div className="sm:col-span-3">
                  <FormInput 
                    id="price" 
                    label="Price" 
                    prefix="€"
                    value={formValues.price} 
                    onChange={e => handleInputChange('price', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="0.00" 
                  />
                </div>

                {/* Re-tender Checkbox */}
                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <input
                      id="retendering"
                      type="checkbox"
                      checked={formValues.retendering}
                      onChange={e => handleInputChange('retendering', e.target.checked)}
                      disabled={isUploaded}
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
                    value={formValues.description} 
                    onChange={e => handleInputChange('description', e.target.value)} 
                    readOnly={isUploaded} 
                    placeholder="Enter tender description" 
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 border-b pb-2">
                Documents
              </h3>
              <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
                <div className="sm:col-span-6 space-y-4">
                  <FileUpload
                    id="document1"
                    label="Tender Document 1 *"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    files={documents}
                    onFilesChange={handleDocumentUpload}
                    placeholder="Upload files or drag and drop"
                    helpText="PDF, DOC, DOCX, XLS up to 10MB"
                    error={requiredDocError ? 'At least one document is required for the tender' : ''}
                    maxFileSize={10}
                  />
                  
                  <FileUpload
                    id="document2"
                    label="Tender Document 2"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    files={document2}
                    onFilesChange={handleDocument2Upload}
                    placeholder="Upload files or drag and drop"
                    helpText="PDF, DOC, DOCX, XLS up to 10MB"
                    maxFileSize={10}
                  />
                  
                  <FileUpload
                    id="document3"
                    label="Tender Document 3"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    files={document3}
                    onFilesChange={handleDocument3Upload}
                    placeholder="Upload files or drag and drop"
                    helpText="PDF, DOC, DOCX, XLS up to 10MB"
                    maxFileSize={10}
                  />
                  
                  <FileUpload
                    id="document4"
                    label="Tender Document 4"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    files={document4}
                    onFilesChange={handleDocument4Upload}
                    placeholder="Upload files or drag and drop"
                    helpText="PDF, DOC, DOCX, XLS up to 10MB"
                    maxFileSize={10}
                  />
                  
                  <FileUpload
                    id="document5"
                    label="Tender Document 5"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    multiple
                    files={document5}
                    onFilesChange={handleDocument5Upload}
                    placeholder="Upload files or drag and drop"
                    helpText="PDF, DOC, DOCX, XLS up to 10MB"
                    maxFileSize={10}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="secondary" 
                className="mr-3"
                disabled={isLoading}
                onClick={() => {
                  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
                    handleResetUpload();
                    setDocuments([]);
                    setDocument2([]);
                    setDocument3([]);
                    setDocument4([]);
                    setDocument5([]);
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                icon={<SaveIcon className="h-4 w-4" />}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Tender'}
              </Button>
            </div>
          </div>
        </form>
      </Card>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}