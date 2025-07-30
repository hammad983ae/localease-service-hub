import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  DollarSign, 
  Calendar,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Eye
} from 'lucide-react';
import { gql, useQuery } from '@apollo/client';
import { useAuth } from '@/contexts/AuthContext';
import QuoteModal from './QuoteModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GET_MY_QUOTE_DOCUMENTS = gql`
  query GetMyQuoteDocuments {
    myQuoteDocuments {
      id
      bookingId
      amount
      currency
      status
      createdAt
      bookingDetails
    }
  }
`;

const GET_ALL_QUOTE_DOCUMENTS = gql`
  query GetAllQuoteDocuments {
    allQuoteDocuments {
      id
      bookingId
      amount
      currency
      status
      createdAt
      bookingDetails
    }
  }
`;

const QuoteDocuments: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  console.log('QuoteDocuments - User:', user);
  console.log('QuoteDocuments - Token:', localStorage.getItem('token'));
  
  const { data, loading, error } = useQuery(
    isAdmin ? GET_ALL_QUOTE_DOCUMENTS : GET_MY_QUOTE_DOCUMENTS,
    {
      onError: (error) => {
        console.error('QuoteDocuments Error:', error);
        console.error('Error details:', error.graphQLErrors, error.networkError);
      },
      onCompleted: (data) => {
        console.log('QuoteDocuments Data:', data);
      }
    }
  );

  const quoteDocuments = data?.myQuoteDocuments || data?.allQuoteDocuments || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const handleViewQuote = (quoteDocument: any) => {
    setSelectedQuote(quoteDocument);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
  };

  const downloadInvoice = async (quoteDocument: any) => {
    const details = quoteDocument.bookingDetails;
    
    // Create a temporary div to render the invoice content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '40px';
    tempDiv.style.fontFamily = 'Arial, sans-serif';
    tempDiv.style.fontSize = '12px';
    tempDiv.style.lineHeight = '1.4';
    
    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1f2937; margin: 0; font-size: 24px;">INVOICE</h1>
        <p style="color: #6b7280; margin: 5px 0;">Invoice #${details.invoiceNumber || 'N/A'}</p>
        <p style="color: #6b7280; margin: 5px 0;">Date: ${formatDate(quoteDocument.createdAt)}</p>
        <p style="color: #6b7280; margin: 5px 0;">Status: ${quoteDocument.status.toUpperCase()}</p>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
        <div>
          <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-bottom: 15px;">CUSTOMER DETAILS</h3>
          <p><strong>Name:</strong> ${details.userDetails?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${details.userDetails?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${details.userDetails?.phone || 'N/A'}</p>
          <p><strong>Address:</strong> ${details.userDetails?.address || 'N/A'}</p>
        </div>
        <div>
          <h3 style="color: #1f2937; border-bottom: 2px solid #10b981; padding-bottom: 5px; margin-bottom: 15px;">SERVICE PROVIDER</h3>
          <p><strong>Name:</strong> ${details.companyDetails?.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${details.companyDetails?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${details.companyDetails?.phone || 'N/A'}</p>
          <p><strong>Address:</strong> ${details.companyDetails?.address || 'N/A'}</p>
          <p><strong>Services:</strong> ${details.companyDetails?.services?.join(', ') || 'N/A'}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #8b5cf6; padding-bottom: 5px; margin-bottom: 15px;">SERVICE DETAILS</h3>
        <p><strong>Service Type:</strong> ${details.bookingType || details.serviceType || 'N/A'}</p>
        <p><strong>Date:</strong> ${details.dateTime ? formatDate(details.dateTime) : 'Flexible'}</p>
        ${details.dateTimeFlexible ? `<p><strong>Flexible:</strong> ${details.dateTimeFlexible}</p>` : ''}
      </div>
      
      ${details.contact ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px;">CONTACT INFORMATION</h3>
        <p><strong>Name:</strong> ${details.contact.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${details.contact.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${details.contact.phone || 'N/A'}</p>
        ${details.contact.notes ? `<p><strong>Notes:</strong> ${details.contact.notes}</p>` : ''}
      </div>
      ` : ''}
      
      ${details.addresses ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #ef4444; padding-bottom: 5px; margin-bottom: 15px;">PICKUP & DELIVERY ADDRESSES</h3>
        <p><strong>From:</strong> ${details.addresses.from || 'N/A'}</p>
        <p><strong>To:</strong> ${details.addresses.to || 'N/A'}</p>
      </div>
      ` : ''}
      
      ${details.pickupAddress ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #ef4444; padding-bottom: 5px; margin-bottom: 15px;">PICKUP ADDRESS</h3>
        <p>${details.pickupAddress.fullAddress || 'N/A'}</p>
      </div>
      ` : ''}
      
      ${details.pickupLocation ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #ef4444; padding-bottom: 5px; margin-bottom: 15px;">TRANSPORT DETAILS</h3>
        <p><strong>Pickup:</strong> ${details.pickupLocation.fullAddress || 'N/A'}</p>
        <p><strong>Dropoff:</strong> ${details.dropoffLocation?.fullAddress || 'N/A'}</p>
      </div>
      ` : ''}
      
      ${details.rooms ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #6366f1; padding-bottom: 5px; margin-bottom: 15px;">ROOM DETAILS</h3>
        ${details.rooms.map((room: any) => 
          `<p><strong>${room.floor} - ${room.room}:</strong> ${room.count} items</p>`
        ).join('')}
      </div>
      ` : ''}
      
      ${details.items ? `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #1f2937; border-bottom: 2px solid #f59e0b; padding-bottom: 5px; margin-bottom: 15px;">ITEM DETAILS</h3>
        ${Array.isArray(details.items) ? 
          details.items.map((item: any) => 
            `<p>${typeof item === 'object' ? 
              Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ') :
              item
            }</p>`
          ).join('') : 
          `<p>${JSON.stringify(details.items, null, 2)}</p>`
        }
      </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 40px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
        <h2 style="color: #1f2937; margin: 0 0 10px 0;">TOTAL AMOUNT</h2>
        <p style="font-size: 24px; font-weight: bold; color: #10b981; margin: 0;">${formatCurrency(quoteDocument.amount, quoteDocument.currency)}</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280;">
        <p>Generated on: ${formatDate(details.generatedAt || quoteDocument.createdAt)}</p>
        <p>Accepted on: ${formatDate(details.acceptedAt || quoteDocument.createdAt)}</p>
        <p>Booking Status: ${details.bookingStatus || 'completed'}</p>
      </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`invoice-${details.invoiceNumber || 'quote'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download if PDF generation fails
      const invoice = `
INVOICE

Invoice Number: ${details.invoiceNumber || 'N/A'}
Date: ${formatDate(quoteDocument.createdAt)}
Status: ${quoteDocument.status.toUpperCase()}

CUSTOMER DETAILS:
Name: ${details.userDetails?.name || 'N/A'}
Email: ${details.userDetails?.email || 'N/A'}
Phone: ${details.userDetails?.phone || 'N/A'}
Address: ${details.userDetails?.address || 'N/A'}

SERVICE PROVIDER:
Name: ${details.companyDetails?.name || 'N/A'}
Email: ${details.companyDetails?.email || 'N/A'}
Phone: ${details.companyDetails?.phone || 'N/A'}
Address: ${details.companyDetails?.address || 'N/A'}
Services: ${details.companyDetails?.services?.join(', ') || 'N/A'}

SERVICE DETAILS:
Service Type: ${details.bookingType || details.serviceType || 'N/A'}
Date: ${details.dateTime ? formatDate(details.dateTime) : 'Flexible'}
${details.dateTimeFlexible ? `Flexible: ${details.dateTimeFlexible}` : ''}

${details.contact ? `
CONTACT INFORMATION:
Name: ${details.contact.name || 'N/A'}
Email: ${details.contact.email || 'N/A'}
Phone: ${details.contact.phone || 'N/A'}
Notes: ${details.contact.notes || 'N/A'}
` : ''}

${details.addresses ? `
PICKUP & DELIVERY ADDRESSES:
From: ${details.addresses.from || 'N/A'}
To: ${details.addresses.to || 'N/A'}
` : ''}

${details.pickupAddress ? `
PICKUP ADDRESS:
${details.pickupAddress.fullAddress || 'N/A'}
` : ''}

${details.pickupLocation ? `
PICKUP LOCATION:
${details.pickupLocation.fullAddress || 'N/A'}

DROPOFF LOCATION:
${details.dropoffLocation?.fullAddress || 'N/A'}
` : ''}

${details.rooms ? `
ROOM DETAILS:
${details.rooms.map((room: any) => 
  `${room.floor} - ${room.room}: ${room.count} items`
).join('\n')}
` : ''}

${details.items ? `
ITEM DETAILS:
${Array.isArray(details.items) ? 
  details.items.map((item: any) => 
    typeof item === 'object' ? 
      Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ') :
      item
  ).join(', ') : 
  JSON.stringify(details.items, null, 2)
}
` : ''}

TOTAL AMOUNT: ${formatCurrency(quoteDocument.amount, quoteDocument.currency)}

Generated on: ${formatDate(details.generatedAt || quoteDocument.createdAt)}
Accepted on: ${formatDate(details.acceptedAt || quoteDocument.createdAt)}
Booking Status: ${details.bookingStatus || 'completed'}
      `.trim();

      const blob = new Blob([invoice], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${details.invoiceNumber || 'quote'}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Quote Documents...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Documents</h3>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quote Documents</h1>
        <p className="text-gray-600 mt-2">
          {isAdmin ? 'All accepted quotes and invoices' : 'Your accepted quotes and invoices'}
        </p>
      </div>

      {quoteDocuments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Quote Documents</h3>
          <p className="text-muted-foreground">
            {isAdmin ? 'No accepted quotes found.' : 'You don\'t have any accepted quotes yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quoteDocuments.map((doc: any) => (
            <Card key={doc.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                                         <FileText className="h-5 w-5 text-primary" />
                     Invoice #{doc.bookingDetails?.invoiceNumber || 'N/A'}
                  </CardTitle>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    {doc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-semibold text-lg">
                    {formatCurrency(doc.amount, doc.currency)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(doc.createdAt)}</span>
                  </div>
                  
                                     <div className="flex items-center gap-2 text-sm">
                     <User className="h-4 w-4 text-muted-foreground" />
                     <span>{doc.bookingDetails?.userDetails?.name || 'N/A'}</span>
                   </div>
                   
                   <div className="flex items-center gap-2 text-sm">
                     <Building2 className="h-4 w-4 text-muted-foreground" />
                     <span>{doc.bookingDetails?.companyDetails?.name || 'N/A'}</span>
                   </div>
                   
                   <div className="flex items-center gap-2 text-sm">
                     <MapPin className="h-4 w-4 text-muted-foreground" />
                     <span className="truncate">
                       {doc.bookingDetails?.addresses?.from || 
                        doc.bookingDetails?.pickupAddress?.fullAddress || 
                        doc.bookingDetails?.pickupLocation?.fullAddress || 'N/A'}
                     </span>
                   </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button
                    onClick={() => handleViewQuote(doc)}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => downloadInvoice(doc)}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      <QuoteModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        quoteDocument={selectedQuote}
      />
    </div>
  );
};

export default QuoteDocuments; 