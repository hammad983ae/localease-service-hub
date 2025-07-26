import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DisposalDateTimeContactFormProps {
  dateTimeData: any;
  contactData: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  onDateTimeUpdate: (dateTime: any) => void;
  onContactUpdate: (contact: any) => void;
}

const DisposalDateTimeContactForm: React.FC<DisposalDateTimeContactFormProps> = ({
  dateTimeData,
  contactData,
  onDateTimeUpdate,
  onContactUpdate
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(dateTimeData?.date || null);
  const [selectedTime, setSelectedTime] = useState<string>(dateTimeData?.time || '');

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const flexibleOptions = [
    { id: 'flexible', label: 'Flexible timing (we\'ll call to arrange)' },
    { id: 'morning', label: 'Morning (8:00 - 12:00)' },
    { id: 'afternoon', label: 'Afternoon (12:00 - 17:00)' },
    { id: 'weekend', label: 'Weekend preferred' }
  ];

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateTimeUpdate({ date, time: selectedTime });
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onDateTimeUpdate({ date: selectedDate, time });
  };

  const handleContactChange = (field: string, value: string) => {
    onContactUpdate({ ...contactData, [field]: value });
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Date & Time Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Schedule Pickup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Select Time</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>Or Choose Flexible Option</Label>
            <div className="space-y-2 mt-2">
              {flexibleOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedTime === option.id ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleTimeSelect(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={contactData.name}
                onChange={(e) => handleContactChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={contactData.email}
                onChange={(e) => handleContactChange('email', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={contactData.phone}
              onChange={(e) => handleContactChange('phone', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or notes..."
              value={contactData.notes}
              onChange={(e) => handleContactChange('notes', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DisposalDateTimeContactForm; 