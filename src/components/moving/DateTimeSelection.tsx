
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onUpdate({ date, time: selectedTime });
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onUpdate({ date: selectedDate, time });
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('common.date')}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {generateDates().map((date, index) => (
              <Button
                key={index}
                variant={selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? "default" : "outline"}
                onClick={() => handleDateSelect(date)}
                className="h-auto p-3 flex flex-col"
              >
                <div className="text-xs opacity-70">
                  {format(date, 'EEE')}
                </div>
                <div className="font-medium">
                  {format(date, 'MMM d')}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('common.time')}</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DateTimeSelection;
