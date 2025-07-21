
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateTimeSelectionProps {
  data: any;
  onUpdate: (dateTime: any) => void;
}

const DateTimeSelection: React.FC<DateTimeSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date | null>(data?.date || null);
  const [selectedTime, setSelectedTime] = useState<string>(data?.time || '');

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
      onUpdate({ date, time: selectedTime });
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({ date: selectedDate, time });
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('common.date')}</h3>
          </div>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate || undefined}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              initialFocus
              className={cn("rounded-md border pointer-events-auto")}
            />
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 bg-muted rounded-lg text-center">
              <p className="font-medium text-primary">
                Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('common.time')}</h3>
          </div>
          
          <div className="space-y-4">
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
                    className="w-full justify-start text-left h-auto p-3"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {selectedTime && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
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
  );
};

export default DateTimeSelection;
