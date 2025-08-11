import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/api/client';
import QuoteModal from './QuoteModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuoteDocument {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  bookingDetails?: any;
}

const QuoteDocuments: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedQuote, setSelectedQuote] = useState<QuoteDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quoteDocuments, setQuoteDocuments] = useState<QuoteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('QuoteDocuments - User:', user);
  console.log('QuoteDocuments - Token:', localStorage.getItem('token'));
  
  // Fetch quote documents
  useEffect(() => {
    const fetchQuoteDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isAdmin) {
          const response = await apiClient.getAdminInvoices();
          setQuoteDocuments(response.invoices || []);
        } else {
          const response = await apiClient.getQuoteDocuments();
          setQuoteDocuments(response.quotes || []);
        }
      } catch (err: any) {
        console.error('Error fetching quote documents:', err);
        setError(err.message || 'Failed to fetch quote documents');
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteDocuments();
  }, [isAdmin]);

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

  const handleViewQuote = (quoteDocument: QuoteDocument) => {
    setSelectedQuote(quoteDocument);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuote(null);
  };

  const downloadInvoice = async (quoteDocument: QuoteDocument) => {
    try {
      // Create a temporary div to render the invoice
      const invoiceDiv = document.createElement('div');
      invoiceDiv.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Invoice</h1>
          <div style="margin-bottom: 20px;">
            <p><strong>Invoice ID:</strong> ${quoteDocument.id}</p>
            <p><strong>Booking ID:</strong> ${quoteDocument.bookingId}</p>
            <p><strong>Amount:</strong> ${formatCurrency(quoteDocument.amount, quoteDocument.currency)}</p>
            <p><strong>Status:</strong> ${quoteDocument.status}</p>
            <p><strong>Created:</strong> ${formatDate(quoteDocument.createdAt)}</p>
          </div>
          ${quoteDocument.bookingDetails ? `
            <div style="margin-top: 20px;">
              <h3>Booking Details</h3>
              <pre style="background: #f3f4f6; padding: 10px; border-radius: 5px;">${JSON.stringify(quoteDocument.bookingDetails, null, 2)}</pre>
            </div>
          ` : ''}
        </div>
      `;
      
      document.body.appendChild(invoiceDiv);
      
      const canvas = await html2canvas(invoiceDiv);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
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
      
      pdf.save(`invoice-${quoteDocument.id}.pdf`);
      document.body.removeChild(invoiceDiv);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quote documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading documents</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (quoteDocuments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quote documents</h3>
          <p className="text-gray-500">
            {isAdmin ? 'No quote documents found in the system' : 'You don\'t have any quote documents yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quote Documents</h2>
        <div className="text-sm text-gray-500">
          {quoteDocuments.length} document{quoteDocuments.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quoteDocuments.map((quoteDocument) => (
          <Card key={quoteDocument.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Invoice #{quoteDocument.id.slice(-8)}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(quoteDocument.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={quoteDocument.status === 'paid' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {quoteDocument.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(quoteDocument.amount, quoteDocument.currency)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Booking #{quoteDocument.bookingId}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewQuote(quoteDocument)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoice(quoteDocument)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

             {selectedQuote && (
         <QuoteModal
           quoteDocument={selectedQuote}
           isOpen={isModalOpen}
           onClose={handleCloseModal}
         />
       )}
    </div>
  );
};

export default QuoteDocuments; 