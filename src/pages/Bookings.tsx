
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Bookings: React.FC = () => {
  const { t } = useLanguage();

  const bookings = [
    {
      id: 1,
      service: 'Moving',
      date: '2024-01-15',
      time: '10:00',
      status: 'Confirmed',
      address: '123 Main St, City'
    },
    {
      id: 2,
      service: 'Disposal',
      date: '2024-01-20',
      time: '14:00',
      status: 'Pending',
      address: '456 Oak Ave, Town'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.bookings')}
        </h1>
        <p className="text-muted-foreground">
          Manage your service bookings
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{booking.service}</span>
                <span className={`text-sm px-2 py-1 rounded-full ${
                  booking.status === 'Confirmed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{booking.address}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Bookings;
