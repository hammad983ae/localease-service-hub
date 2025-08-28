import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, DollarSign } from 'lucide-react';

interface AdminBookingDetailsProps {
  user: any;
  isAdmin: boolean;
  selectedChatRoom: any;
  bookingDetails: any;
  showCompanySelector: boolean;
  setShowCompanySelector: (show: boolean) => void;
  showQuoteForm: boolean;
  setShowQuoteForm: (show: boolean) => void;
}

export const AdminBookingDetails: React.FC<AdminBookingDetailsProps> = ({
  user,
  isAdmin,
  selectedChatRoom,
  bookingDetails,
  showCompanySelector,
  setShowCompanySelector,
  showQuoteForm,
  setShowQuoteForm
}) => {
  if (!(user?.role === 'admin' || isAdmin) || !selectedChatRoom.bookingId) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900">Complete Booking Information</h4>
        <Badge variant="outline" className="text-xs">
          {selectedChatRoom.bookingType || 'Unknown Type'}
        </Badge>
      </div>
      
      {/* Basic Chat Room Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <p className="text-gray-600 font-medium">Booking ID</p>
          <p className="text-gray-900">{selectedChatRoom.bookingId}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">User ID</p>
          <p className="text-gray-900">{selectedChatRoom.userId}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Chat Type</p>
          <p className="text-gray-900">{selectedChatRoom.chatType}</p>
        </div>
        <div>
          <p className="text-gray-600 font-medium">Status</p>
          <p className="text-gray-900">{selectedChatRoom.status || 'Active'}</p>
        </div>
      </div>

      {/* Detailed Booking Info (if available) */}
      {bookingDetails && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h5 className="font-medium text-gray-900 mb-2">Detailed Booking Information</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {bookingDetails.contact && typeof bookingDetails.contact === 'object' && (
              <div>
                <p className="text-gray-600 font-medium">Contact Information</p>
                <div className="bg-white p-2 rounded border">
                  <p><strong>Name:</strong> {typeof bookingDetails.contact.name === 'string' ? bookingDetails.contact.name : 'N/A'}</p>
                  <p><strong>Email:</strong> {typeof bookingDetails.contact.email === 'string' ? bookingDetails.contact.email : 'N/A'}</p>
                  <p><strong>Phone:</strong> {typeof bookingDetails.contact.phone === 'string' ? bookingDetails.contact.phone : 'N/A'}</p>
                  {bookingDetails.contact.notes && typeof bookingDetails.contact.notes === 'string' && (
                    <p><strong>Notes:</strong> {bookingDetails.contact.notes}</p>
                  )}
                </div>
              </div>
            )}
            
            {bookingDetails.addresses && Array.isArray(bookingDetails.addresses) && bookingDetails.addresses.length > 0 && (
              <div>
                <p className="text-gray-600 font-medium">Addresses</p>
                <div className="bg-white p-2 rounded border">
                  {bookingDetails.addresses.map((addr: any, index: number) => (
                    <div key={index} className="mb-2">
                      <p><strong>{typeof addr.type === 'string' ? addr.type : 'Address'} {index + 1}:</strong> {typeof addr.address === 'string' ? addr.address : 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {bookingDetails.rooms && Array.isArray(bookingDetails.rooms) && bookingDetails.rooms.length > 0 && (
              <div>
                <p className="text-gray-600 font-medium">Rooms</p>
                <div className="bg-white p-2 rounded border">
                  {bookingDetails.rooms.map((room: any, index: number) => (
                    <div key={index} className="mb-1">
                      <p>Floor {typeof room.floor === 'number' ? room.floor : 'N/A'}, Room {typeof room.room === 'string' ? room.room : 'N/A'}: {typeof room.count === 'number' ? room.count : 'N/A'} items</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {bookingDetails.items && Array.isArray(bookingDetails.items) && bookingDetails.items.length > 0 && (
              <div>
                <p className="text-gray-600 font-medium">Items</p>
                <div className="bg-white p-2 rounded border">
                  <p>{bookingDetails.items.map((item: any) => typeof item === 'string' ? item : 'Unknown Item').join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompanySelector(!showCompanySelector)}
          className="text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          <Building2 className="w-4 h-4 mr-1" />
          Send Company Profile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowQuoteForm(!showQuoteForm)}
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <DollarSign className="w-4 h-4 mr-1" />
          Send Quote
        </Button>
      </div>
    </div>
  );
};
