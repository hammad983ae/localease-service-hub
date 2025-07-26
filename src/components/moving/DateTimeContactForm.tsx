
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimeContactFormProps {
  dateTimeData: any;
  contactData: { name: string; email: string; phone: string; notes: string };
  onDateTimeUpdate: (dateTime: any) => void;
  onContactUpdate: (contact: { name: string; email: string; phone: string; notes: string }) => void;
}

const DateTimeContactForm: React.FC<DateTimeContactFormProps> = ({
  dateTimeData,
  contactData,
  onDateTimeUpdate,
  onContactUpdate
}) => {
  const { t } = useLanguage();
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Date & Time Selection */}
        <div className="space-y-6">
          {/* Date Selection */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <span>Select Date</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={handleDateSelect}
                  disabled={isDateDisabled}
                  initialFocus
                  className={cn("rounded-md border-0 pointer-events-auto")}
                />
              </div>
              {selectedDate && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
                  <p className="font-medium text-primary">
                    Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                <span>Preferred Time</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Specific Time Slots */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Specific Time</h4>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time)}
                      size="sm"
                      className="h-9"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Flexible Options */}
              <div>
                <h4 className="text-sm font-medium mb-3 text-muted-foreground">Flexible Options</h4>
                <div className="space-y-2">
                  {flexibleOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={selectedTime === option.id ? "default" : "outline"}
                      onClick={() => handleTimeSelect(option.id)}
                      className="w-full justify-start text-left h-auto p-3 text-sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    Time preference: {
                      timeSlots.includes(selectedTime) 
                        ? selectedTime 
                        : flexibleOptions.find(opt => opt.id === selectedTime)?.label
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Full Name</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={contactData.name}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                  className="h-12 bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Email Address</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={contactData.email}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                  className="h-12 bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={contactData.phone}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                  className="h-12 bg-white/50 border-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Additional Notes</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or additional information"
                  value={contactData.notes}
                  onChange={(e) => handleContactChange('notes', e.target.value)}
                  rows={4}
                  className="bg-white/50 border-primary/20 focus:border-primary resize-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DateTimeContactForm;
