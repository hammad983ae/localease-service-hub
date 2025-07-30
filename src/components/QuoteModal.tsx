import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Download,
  X,
  DollarSign,
  Package,
  Home,
  Truck
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  quoteDocument: any;
}

const QuoteModal: React.FC<QuoteModalProps> = ({ isOpen, onClose, quoteDocument }) => {
  if (!quoteDocument) return null;

  const details = quoteDocument.bookingDetails;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const pdfRef = useRef<HTMLDivElement>(null);

  const downloadInvoice = async () => {
    if (!pdfRef.current) return;

    try {
      const canvas = await html2canvas(pdfRef.current, {
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${details.invoiceNumber || 'quote'}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Quote Details
          </DialogTitle>
        </DialogHeader>
        
        <div ref={pdfRef} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <div>
              <h2 className="text-xl font-bold">Invoice #{details.invoiceNumber || 'N/A'}</h2>
              <p className="text-sm text-muted-foreground">
                Generated on {formatDate(details.generatedAt || quoteDocument.createdAt)}
              </p>
            </div>
                         <div className="flex gap-2">
               <Button onClick={downloadInvoice} variant="outline" size="sm">
                 <Download className="h-4 w-4 mr-2" />
                 Download PDF
               </Button>
               <Button onClick={onClose} variant="outline" size="sm">
                 <X className="h-4 w-4" />
               </Button>
             </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Customer Details
              </h3>
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{details.userDetails?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{details.userDetails?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{details.userDetails?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span className="text-sm">{details.userDetails?.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Service Provider
              </h3>
              <div className="space-y-3 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span>{details.companyDetails?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{details.companyDetails?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{details.companyDetails?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span className="text-sm">{details.companyDetails?.address || 'N/A'}</span>
                </div>
                {details.companyDetails?.services && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Services:</span>
                    <span className="text-sm">{details.companyDetails.services.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5 text-purple-600" />
              Service Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Service Type:</span>
                  <Badge variant="secondary">{details.bookingType || details.serviceType || 'N/A'}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Date:</span>
                  <span>{details.dateTime ? formatDate(details.dateTime) : 'Flexible'}</span>
                </div>
                {details.dateTimeFlexible && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Flexible:</span>
                    <span>{details.dateTimeFlexible}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatCurrency(quoteDocument.amount, quoteDocument.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Status:</span>
                  <Badge variant="default" className="bg-green-100 text-green-700">
                    {quoteDocument.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          {details.contact && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-600" />
                  Contact Information
                </h3>
                <div className="p-4 bg-orange-50 rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{details.contact.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{details.contact.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{details.contact.phone || 'N/A'}</span>
                  </div>
                  {details.contact.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{details.contact.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Addresses */}
          {(details.addresses || details.pickupAddress || details.pickupLocation) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Location Details
                </h3>
                <div className="space-y-4">
                  {details.addresses && (
                    <div className="p-4 bg-red-50 rounded-lg space-y-3">
                      <h4 className="font-medium text-red-800">Pickup & Delivery</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">From:</span>
                          <span className="text-sm">{details.addresses.from || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">To:</span>
                          <span className="text-sm">{details.addresses.to || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {details.pickupAddress && (
                    <div className="p-4 bg-red-50 rounded-lg space-y-3">
                      <h4 className="font-medium text-red-800">Pickup Address</h4>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{details.pickupAddress.fullAddress || 'N/A'}</span>
                      </div>
                    </div>
                  )}

                  {details.pickupLocation && (
                    <div className="p-4 bg-red-50 rounded-lg space-y-3">
                      <h4 className="font-medium text-red-800">Transport Details</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Pickup:</span>
                          <span className="text-sm">{details.pickupLocation.fullAddress || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Dropoff:</span>
                          <span className="text-sm">{details.dropoffLocation?.fullAddress || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Rooms */}
          {details.rooms && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Home className="h-5 w-5 text-indigo-600" />
                  Room Details
                </h3>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <div className="space-y-2">
                    {details.rooms.map((room: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{room.floor} - {room.room}</span>
                        </div>
                        <Badge variant="outline">{room.count} items</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Items */}
          {details.items && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  Item Details
                </h3>
                <div className="p-4 bg-amber-50 rounded-lg">
                  {Array.isArray(details.items) ? (
                    <div className="space-y-2">
                      {details.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {typeof item === 'object' ? 
                              Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ') :
                              item
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2 bg-white rounded border">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(details.items, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <Separator />
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <p>Generated on: {formatDate(details.generatedAt || quoteDocument.createdAt)}</p>
              <p>Accepted on: {formatDate(details.acceptedAt || quoteDocument.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Booking Status</p>
              <Badge variant="secondary">{details.bookingStatus || 'completed'}</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuoteModal; 