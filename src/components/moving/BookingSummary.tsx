
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Package, Calendar, MapPin, User, Phone, Mail, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface RoomData {
  floor: string;
  room: string;
  count: number;
}

interface MovingData {
  rooms: RoomData[];
  items: Record<string, number>;
  dateTime: any;
  addresses: { from: string; to: string };
  contact: { name: string; email: string; phone: string; notes: string };
}

interface BookingSummaryProps {
  data: MovingData;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ data }) => {
  const { t } = useLanguage();

  const floors = {
    basement: { label: t('floor.basement'), icon: '🏠' },
    ground: { label: t('floor.ground'), icon: '🏡' },
    first: { label: t('floor.first'), icon: '🏢' },
    second: { label: t('floor.second'), icon: '🏗️' },
  };

  const roomTypes = {
    kitchen: { label: t('room.kitchen'), icon: '👨‍🍳' },
    bedroom: { label: t('room.bedroom'), icon: '🛏️' },
    livingRoom: { label: t('room.livingRoom'), icon: '🛋️' },
    bathroom: { label: t('room.bathroom'), icon: '🚿' },
    office: { label: t('room.office'), icon: '💼' },
    garage: { label: t('room.garage'), icon: '🚗' },
  };

  const itemNames = {
    sofa: t('item.sofa'),
    bed: t('item.bed'),
    wardrobe: t('item.wardrobe'),
    fridge: t('item.fridge'),
    washer: t('item.washer'),
    tv: t('item.tv'),
    coffeeTable: 'Coffee Table',
    armchair: 'Armchair',
    bookshelf: 'Bookshelf',
    dresser: 'Dresser',
    nightstand: 'Nightstand',
    mirror: 'Mirror',
    microwave: 'Microwave',
    dishwasher: 'Dishwasher',
    diningTable: 'Dining Table',
    washingMachine: 'Washing Machine',
    cabinet: 'Cabinet',
    desk: 'Desk',
    chair: 'Office Chair',
    fileCabinet: 'File Cabinet',
    toolbox: 'Toolbox',
    workbench: 'Workbench',
    shelving: 'Shelving Unit',
    bike: 'Bicycle',
  };

  const totalRooms = data.rooms.reduce((sum, room) => sum + room.count, 0);
  const totalItems = Object.values(data.items).reduce((sum, count) => sum + count, 0);

  // Group rooms by floor
  const roomsByFloor = data.rooms.reduce((acc, room) => {
    if (!acc[room.floor]) {
      acc[room.floor] = [];
    }
    acc[room.floor].push(room);
    return acc;
  }, {} as Record<string, RoomData[]>);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Booking Summary
        </h2>
        <p className="text-muted-foreground">Review your moving details before submitting</p>
        
        <div className="flex justify-center gap-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Home className="h-4 w-4 mr-2" />
            {totalRooms} room{totalRooms !== 1 ? 's' : ''}
          </Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Package className="h-4 w-4 mr-2" />
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Rooms & Items */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardTitle className="flex items-center space-x-2">
            <Home className="h-5 w-5" />
            <span>Rooms & Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {Object.entries(roomsByFloor).map(([floorId, floorRooms]) => {
            const floor = floors[floorId as keyof typeof floors];
            if (!floor) return null;

            return (
              <div key={floorId} className="space-y-2">
                <h3 className="font-semibold flex items-center space-x-2">
                  <span className="text-xl">{floor.icon}</span>
                  <span>{floor.label}</span>
                </h3>
                <div className="ml-6 space-y-1">
                  {floorRooms.map((room, index) => {
                    const roomType = roomTypes[room.room as keyof typeof roomTypes];
                    return (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <span>{roomType?.icon}</span>
                        <span>{roomType?.label || room.room} × {room.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {totalItems > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Selected Items:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data.items).map(([itemId, quantity]) => (
                  <div key={itemId} className="text-sm">
                    {itemNames[itemId as keyof typeof itemNames] || itemId} × {quantity}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Date & Time */}
      {data.dateTime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Date & Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{format(new Date(data.dateTime), 'PPP p')}</p>
          </CardContent>
        </Card>
      )}

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Addresses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.addresses.from && (
            <div>
              <p className="font-medium text-green-600">From:</p>
              <p>{data.addresses.from}</p>
            </div>
          )}
          {data.addresses.to && (
            <div>
              <p className="font-medium text-red-600">To:</p>
              <p>{data.addresses.to}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Contact Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{data.contact.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{data.contact.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{data.contact.phone}</span>
          </div>
          {data.contact.notes && (
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-1" />
              <span className="text-sm">{data.contact.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSummary;
