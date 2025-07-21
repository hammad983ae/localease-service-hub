
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Calendar, Clock, User } from 'lucide-react';

const Transport: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    notes: '',
    contact: { name: '', email: '', phone: '' }
  });

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = () => {
    console.log('Transport request:', formData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('transport.title')}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-600" />
              <Label htmlFor="pickup">{t('transport.pickup')}</Label>
            </div>
            <Input
              id="pickup"
              placeholder="Enter pickup location"
              value={formData.pickup}
              onChange={(e) => setFormData(prev => ({ ...prev, pickup: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-600" />
              <Label htmlFor="dropoff">{t('transport.dropoff')}</Label>
            </div>
            <Input
              id="dropoff"
              placeholder="Enter drop-off location"
              value={formData.dropoff}
              onChange={(e) => setFormData(prev => ({ ...prev, dropoff: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted rounded-lg p-4">
        <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Route map will show here</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('common.date')}</h3>
          </div>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          />
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
                variant={formData.time === time ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, time }))}
                size="sm"
              >
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">{t('transport.notes')}</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or additional information"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('common.name')}</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.contact.name}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact: { ...prev.contact, name: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={formData.contact.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact: { ...prev.contact, email: e.target.value }
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t('common.phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.contact.phone}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  contact: { ...prev.contact, phone: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmit}
        className="w-full h-12 text-lg font-medium"
        size="lg"
      >
        {t('common.submit')}
      </Button>
    </div>
  );
};

export default Transport;
