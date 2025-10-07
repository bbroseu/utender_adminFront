import React, { useEffect, useState, useRef } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { SearchableDropdown } from '../../ui/SearchableDropdown';
import { FileTextIcon, CheckIcon, DownloadIcon, EuroIcon, UserIcon, PackageIcon } from 'lucide-react';
import sepUsersService, { SepUser } from '../../../services/sepUsersService';
import { useToast, ToastContainer } from '../../ui/Toast';
import jsPDF from 'jspdf';

interface ClientOption {
  value: number;
  label: string;
  email: string;
  name: string;
  company?: string;
}

interface PackageOption {
  value: string;
  label: string;
  price: number;
  duration: string;
  description: string;
}

interface CompanyBranding {
  icon: string;
  name: string;
  color: string;
  backgroundColor: string;
}


export function GenerateInvoice() {
  const { toasts, removeToast, success, error } = useToast();
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  const [invoiceData, setInvoiceData] = useState({
    clientId: null as number | null,
    packageType: '',
    customPrice: ''
  });

  const [clients, setClients] = useState<ClientOption[]>([]);
  // Company branding mapping based on client company/firm
  const getCompanyBranding = (clientCompany?: string): CompanyBranding => {
    if (!clientCompany) {
      return {
        icon: 'b',
        name: 'BBROS',
        color: '#ffffff',
        backgroundColor: '#e53e3e'
      };
    }

    const company = clientCompany.toLowerCase();
    
    if (company.includes('bbros') || company.includes('b-bros')) {
      return {
        icon: 'b',
        name: 'BBROS',
        color: '#ffffff',
        backgroundColor: '#e53e3e'
      };
    } else if (company.includes('utender') || company.includes('u-tender')) {
      return {
        icon: 'U',
        name: 'UTENDER',
        color: '#ffffff',
        backgroundColor: '#3182ce'
      };
    } else if (company.includes('tender') || company.includes('prokurim')) {
      return {
        icon: 'T',
        name: 'TENDER',
        color: '#ffffff',
        backgroundColor: '#38a169'
      };
    } else {
      // Default branding for unknown companies
      return {
        icon: clientCompany.charAt(0).toUpperCase(),
        name: clientCompany.toUpperCase(),
        color: '#ffffff',
        backgroundColor: '#6b7280'
      };
    }
  };
  const [packages] = useState<PackageOption[]>([
    {
      value: '1_month',
      label: '1 Month Package',
      price: 0,
      duration: '30 days',
      description: 'Basic monthly access to tender notifications'
    },
    {
      value: '3_months',
      label: '3 Months Package',
      price: 0,
      duration: '90 days',
      description: 'Quarterly access with priority notifications'
    },
    {
      value: '6_months',
      label: '6 Months Package',
      price: 0,
      duration: '180 days',
      description: 'Semi-annual access with advanced features'
    },
    {
      value: '12_months',
      label: '12 Months Package',
      price: 0,
      duration: '365 days',
      description: 'Annual access with all premium features'
    }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Load active clients on component mount
  useEffect(() => {
    loadActiveClients();
  }, []);

  const loadActiveClients = async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await sepUsersService.getActive();
      const usersArray = Array.isArray(data) ? data : [];
      
      // Transform users to client options for dropdown
      const clientOptions: ClientOption[] = usersArray.map(user => ({
        value: user.id,
        label: `${user.name || user.username}${user.company ? ` - ${user.company}` : ''} (${user.email})`,
        email: user.email,
        name: user.name || user.username,
        company: user.company
      }));
      
      setClients(clientOptions);
    } catch (err: any) {
      console.error('Error loading active clients:', err);
      setApiError(err.message || 'Failed to load active clients');
      error('Failed to load clients', err.message || 'Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (clientId: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      clientId: Number(clientId)
    }));
  };

  const handlePackageSelect = (packageValue: string | number) => {
    setInvoiceData(prev => ({
      ...prev,
      packageType: String(packageValue)
      // Don't automatically set price - let admin enter it manually
    }));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!invoiceData.clientId) {
      error('Validation Error', 'Please select a client');
      return false;
    }
    if (!invoiceData.packageType) {
      error('Validation Error', 'Please select a package');
      return false;
    }
    if (!invoiceData.customPrice || parseFloat(invoiceData.customPrice) <= 0) {
      error('Validation Error', 'Please enter a valid price');
      return false;
    }
    return true;
  };

  const generateInvoiceNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsGenerating(true);
      
      // Generate invoice number
      const newInvoiceNumber = generateInvoiceNumber();
      setInvoiceNumber(newInvoiceNumber);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInvoiceGenerated(true);
      success('Invoice Generated', 'Invoice has been created successfully');
    } catch (err: any) {
      error('Generation Failed', 'Failed to generate invoice. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setInvoiceData({
      clientId: null,
      packageType: '',
      customPrice: ''
    });
    setInvoiceGenerated(false);
    setInvoiceNumber('');
  };

  const generatePDF = () => {
    try {
      // Get current data for PDF generation
      const selectedClient = clients.find(client => client.value === invoiceData.clientId);
      const selectedPackage = packages.find(pkg => pkg.value === invoiceData.packageType);
      const companyBranding = getCompanyBranding(selectedClient?.company);
      const totalPrice = parseFloat(invoiceData.customPrice) || 0;
      const currentDate = new Date().toLocaleDateString('en-GB');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text
      const addText = (text: string, x: number, y: number, fontSize = 10, style = 'normal') => {
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', style);
        pdf.text(text, x, y);
        return y + (fontSize * 0.35);
      };

      // Helper function to draw rectangle
      const drawRect = (x: number, y: number, width: number, height: number, fill = false) => {
        if (fill) {
          pdf.setFillColor(247, 250, 252);
          pdf.rect(x, y, width, height, 'F');
        }
        pdf.setDrawColor(45, 55, 72);
        pdf.setLineWidth(0.5);
        pdf.rect(x, y, width, height);
      };

      // Header - Dynamic Company Logo and Title
      const bgColor = companyBranding.backgroundColor;
      const r = parseInt(bgColor.slice(1, 3), 16);
      const g = parseInt(bgColor.slice(3, 5), 16);
      const b = parseInt(bgColor.slice(5, 7), 16);
      
      pdf.setFillColor(r, g, b);
      pdf.rect(margin, yPosition, 15, 15, 'F');
      
      const iconColor = companyBranding.color;
      const iconR = parseInt(iconColor.slice(1, 3), 16);
      const iconG = parseInt(iconColor.slice(3, 5), 16);
      const iconB = parseInt(iconColor.slice(5, 7), 16);
      
      pdf.setTextColor(iconR, iconG, iconB);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(companyBranding.icon, margin + 7.5, yPosition + 10);
      
      pdf.setTextColor(45, 55, 72);
      pdf.setFontSize(24);
      pdf.text(companyBranding.name, margin + 20, yPosition + 10);
      
      yPosition += 25;

      // Invoice Title and Details
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PRO-FATURË', margin, yPosition);
      
      // Right side details
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const rightX = pageWidth - margin - 50;
      pdf.text(`Gjeneruar: ${currentDate}`, rightX, yPosition);
      pdf.text(`Pro-Fatura: ${invoiceNumber}`, rightX, yPosition + 5);
      pdf.text(`Nr. i klientit: 1000-${selectedClient?.value || '00'}`, rightX, yPosition + 10);
      
      yPosition += 30;

      // Company Information Table
      const tableY = yPosition;
      const colWidth = (pageWidth - 2 * margin) / 3;
      
      // Draw table background and borders
      drawRect(margin, tableY, colWidth, 40, true);
      drawRect(margin + colWidth, tableY, colWidth, 40, true);
      drawRect(margin + 2 * colWidth, tableY, colWidth, 40, true);

      // Column 1 - Buyer
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      let textY = tableY + 5;
      textY = addText('Blerësi:', margin + 2, textY, 9, 'bold');
      pdf.setFont('helvetica', 'normal');
      textY = addText('Arber Bakija', margin + 2, textY, 8);
      textY = addText('BBros L.L.C.', margin + 2, textY, 8);
      addText('Republika e Kosovës', margin + 2, textY, 8);

      // Column 2 - Seller
      textY = tableY + 5;
      pdf.setFont('helvetica', 'bold');
      textY = addText('Shitësi:', margin + colWidth + 2, textY, 9, 'bold');
      pdf.setFont('helvetica', 'normal');
      textY = addText('BBros LLC', margin + colWidth + 2, textY, 8);
      textY = addText('Rr. Rexhep Krasniqi Nr. 5', margin + colWidth + 2, textY, 8);
      textY = addText('10000 Prishtinë', margin + colWidth + 2, textY, 8);
      textY = addText('Republika e Kosovës', margin + colWidth + 2, textY, 8);
      textY = addText('Nr. Biz.: 71028968', margin + colWidth + 2, textY, 8);
      addText('Nr. Fiskal: 601070890', margin + colWidth + 2, textY, 8);

      // Column 3 - Bank Details
      textY = tableY + 5;
      pdf.setFont('helvetica', 'bold');
      textY = addText('Llogarita Bankare:', margin + 2 * colWidth + 2, textY, 9, 'bold');
      pdf.setFont('helvetica', 'normal');
      textY = addText('Emri i Llogarisë: BBros LLC', margin + 2 * colWidth + 2, textY, 8);
      textY = addText('Nr. Llogarisë:', margin + 2 * colWidth + 2, textY, 8);
      addText('1501200000199936', margin + 2 * colWidth + 2, textY, 8);

      yPosition += 50;

      // Invoice Items Table
      const itemsTableY = yPosition;
      const itemsTableHeight = 20;
      const headerHeight = 8;
      
      // Table headers
      drawRect(margin, itemsTableY, pageWidth - 2 * margin, headerHeight, true);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      addText('Nr. Përshkrimi', margin + 2, itemsTableY + 5, 9, 'bold');
      addText('Çmimi', margin + 100, itemsTableY + 5, 9, 'bold');
      addText('Sasia', margin + 130, itemsTableY + 5, 9, 'bold');
      addText('Shuma', margin + 160, itemsTableY + 5, 9, 'bold');

      // Table content
      const contentY = itemsTableY + headerHeight;
      drawRect(margin, contentY, pageWidth - 2 * margin, itemsTableHeight - headerHeight);
      pdf.setFont('helvetica', 'normal');
      addText(`1. Abonimi në www.utender.eu për ${selectedPackage?.duration || '1 muaj'}`, margin + 2, contentY + 5, 8);
      addText(totalPrice.toFixed(0), margin + 100, contentY + 5, 8);
      addText('1', margin + 135, contentY + 5, 8);
      addText(totalPrice.toFixed(0), margin + 165, contentY + 5, 8);

      yPosition += 30;

      // Total
      const totalBoxWidth = 60;
      const totalBoxX = pageWidth - margin - totalBoxWidth;
      pdf.setFillColor(237, 242, 247);
      pdf.rect(totalBoxX, yPosition, totalBoxWidth, 10, 'F');
      pdf.setDrawColor(45, 55, 72);
      pdf.rect(totalBoxX, yPosition, totalBoxWidth, 10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      addText(`Gjithsej (EUR): ${totalPrice.toFixed(0)}`, totalBoxX + 2, yPosition + 6, 10, 'bold');

      yPosition += 40;

      // Footer
      pdf.setDrawColor(45, 55, 72);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(102, 102, 102);
      addText('Vërejtje: Në koment të pagesës suaj ju lutemi shënoni këtë përshkrim:', margin, yPosition, 8);
      yPosition += 10;

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      addText(`Pagesë pro-fatura nr. '${invoiceNumber}' nga klienti nr. '1000-${selectedClient?.value || '00'}'`, margin, yPosition, 9, 'bold');
      
      yPosition += 20;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Website footer
      pdf.setFontSize(8);
      pdf.setTextColor(229, 62, 62);
      pdf.setFont('helvetica', 'bold');
      pdf.text('www.utender.eu', margin, yPosition);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont('helvetica', 'normal');
      pdf.text(' - vendi ku oferta gjen kërkesën', margin + 30, yPosition);
      pdf.text('1', pageWidth - margin - 5, yPosition);

      pdf.save(`${companyBranding.name}-Pro-Fatura-${invoiceNumber}.pdf`);
      success('PDF Downloaded', 'Invoice PDF has been downloaded successfully');
    } catch (err: any) {
      console.error('PDF Generation Error:', err);
      error('PDF Generation Failed', 'Could not generate PDF. Please try again.');
    }
  };

  // Get current data for UI rendering
  const selectedClient = clients.find(client => client.value === invoiceData.clientId);
  const selectedPackage = packages.find(pkg => pkg.value === invoiceData.packageType);
  const companyBranding = getCompanyBranding(selectedClient?.company);
  const totalPrice = parseFloat(invoiceData.customPrice) || 0;
  const currentDate = new Date().toLocaleDateString('en-GB');

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
            <Button onClick={loadActiveClients} variant="primary">Retry</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <FileTextIcon className="h-6 w-6 mr-2 text-blue-600" />
            Generate Invoice
          </h1>
          <p className="text-gray-600 mt-1">Create invoices for client subscriptions and services</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            {invoiceGenerated ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">
                    Invoice Generated Successfully!
                  </h2>
                  <p className="text-gray-500 mb-6 text-center">
                    {companyBranding.name} Pro-Fatura #{invoiceNumber} has been created for {selectedClient?.name}
                    <br />
                    Total Amount: €{totalPrice.toFixed(2)}
                  </p>
                </div>

                {/* Hidden Invoice for PDF Generation */}
                <div ref={invoiceRef} className="hidden">
                  <div style={{ width: '794px', minHeight: '1123px', padding: '40px', fontFamily: 'Arial, sans-serif', backgroundColor: 'white' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                      <div style={{ width: '60px', height: '60px', backgroundColor: '#e53e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px' }}>
                        <span style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>{'}'}</span>
                      </div>
                      <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>BBROS</h1>
                    </div>

                    {/* Invoice Title and Details */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                      <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>PRO-FATURË</h2>
                      <div style={{ textAlign: 'right', fontSize: '16px', lineHeight: '1.5' }}>
                        <div><strong>Gjeneruar:</strong> {currentDate}</div>
                        <div><strong>Pro-Fatura:</strong> {invoiceNumber}</div>
                        <div><strong>Nr. i klientit:</strong> 1000-{selectedClient?.value || '00'}</div>
                      </div>
                    </div>

                    {/* Company Information Table */}
                    <table style={{ width: '100%', border: '2px solid #2d3748', borderCollapse: 'collapse', marginBottom: '40px', fontSize: '14px' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', backgroundColor: '#f7fafc', fontWeight: 'bold', width: '33%' }}>
                            <strong>Blerësi:</strong>
                            <br />Arber Bakija
                            <br />BBros L.L.C.
                            <br />Republika e Kosovës
                          </td>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', backgroundColor: '#f7fafc', fontWeight: 'bold', width: '33%' }}>
                            <strong>Shitësi:</strong>
                            <br />BBros LLC
                            <br />Rr. Rexhep Krasniqi Nr. 5
                            <br />10000 Prishtinë
                            <br />Republika e Kosovës
                            <br />Nr. Biz.: 71028968
                            <br />Nr. Fiskal: 601070890
                          </td>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', backgroundColor: '#f7fafc', fontWeight: 'bold', width: '34%' }}>
                            <strong>Llogarita Bankare:</strong>
                            <br />Emri i Llogarisë: BBros LLC
                            <br />Nr. Llogarisë:
                            <br />1501200000199936
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Invoice Items Table */}
                    <table style={{ width: '100%', border: '2px solid #2d3748', borderCollapse: 'collapse', marginBottom: '40px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f7fafc' }}>
                          <th style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'left', fontSize: '16px', fontWeight: 'bold' }}>Nr. Përshkrimi</th>
                          <th style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>Çmimi</th>
                          <th style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>Sasia</th>
                          <th style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>Shuma</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', fontSize: '14px' }}>
                            1. Abonimi në www.utender.eu për {selectedPackage?.duration || '1 muaj'}
                          </td>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            {totalPrice.toFixed(0)}
                          </td>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            1
                          </td>
                          <td style={{ border: '1px solid #2d3748', padding: '12px', textAlign: 'center', fontSize: '14px' }}>
                            {totalPrice.toFixed(0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
                      <div style={{ backgroundColor: '#edf2f7', padding: '12px 24px', fontSize: '18px', fontWeight: 'bold' }}>
                        Gjithsej (EUR): {totalPrice.toFixed(0)}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '80px', fontSize: '14px', textAlign: 'center' }}>
                      <div style={{ borderTop: '1px solid #2d3748', paddingTop: '20px', color: '#666' }}>
                        Vërejtje: Në koment të pagesës suaj ju lutemi shënoni këtë përshkrim:
                      </div>
                      <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: 'bold' }}>
                        Pagesë pro-fatura nr. '{invoiceNumber}' nga klienti nr. '1000-{selectedClient?.value || '00'}'
                      </div>
                      <div style={{ marginTop: '40px', borderTop: '1px solid #2d3748', paddingTop: '20px' }}>
                        <span style={{ color: '#e53e3e', fontWeight: 'bold' }}>www.utender.eu</span>
                        <span style={{ color: '#666' }}> - vendi ku oferta gjen kërkesën</span>
                        <span style={{ float: 'right' }}>1</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 justify-center">
                  <Button 
                    variant="primary" 
                    icon={<DownloadIcon className="h-4 w-4" />} 
                    onClick={generatePDF}
                  >
                    Download PDF
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    Create Another Invoice
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client Selection */}
                <div>
                  <SearchableDropdown
                    label="Select Client"
                    options={clients.map(client => ({
                      value: client.value,
                      label: client.label
                    }))}
                    value={invoiceData.clientId || ''}
                    onChange={handleClientSelect}
                    placeholder="Search and select a client..."
                    searchPlaceholder="Type to search clients by name, company, or email..."
                    disabled={loading}
                    helpText={`${clients.length} active clients available${selectedClient?.company ? ` • Company: ${companyBranding.name}` : ''}`}
                    icon={
                      selectedClient?.company ? (
                        <div 
                          className="h-4 w-4 rounded flex items-center justify-center text-xs font-bold text-white"
                          style={{ 
                            backgroundColor: companyBranding.backgroundColor
                          }}
                        >
                          {companyBranding.icon}
                        </div>
                      ) : (
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      )
                    }
                  />
                </div>

                {/* Package Selection */}
                <div>
                  <SearchableDropdown
                    label="Select Package"
                    options={packages.map(pkg => ({
                      value: pkg.value,
                      label: pkg.label
                    }))}
                    value={invoiceData.packageType}
                    onChange={handlePackageSelect}
                    placeholder="Choose a subscription package..."
                    searchPlaceholder="Search packages..."
                    helpText="Select from predefined packages or choose custom for special pricing"
                    icon={<PackageIcon className="h-4 w-4 text-blue-600" />}
                  />
                </div>

                {/* Price Input */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <EuroIcon className="h-4 w-4 text-blue-600 mr-2" />
                    Price *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      name="customPrice"
                      step="0.01"
                      min="0"
                      className="block w-full pl-8 pr-16 py-3 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter price amount..."
                      value={invoiceData.customPrice}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">EUR</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Enter the price amount for this invoice manually
                  </p>
                </div>

                {/* Generate Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<FileTextIcon className="h-5 w-5" />}
                    className="w-full"
                    disabled={isGenerating || !invoiceData.clientId || !invoiceData.packageType || !invoiceData.customPrice}
                  >
                    {isGenerating ? 'Generating Invoice...' : 'Generate Invoice'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}