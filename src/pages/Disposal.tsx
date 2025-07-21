
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

const Disposal: React.FC = () => {
  const { t } = useLanguage();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    address: '',
    date: '',
    time: '',
    notes: '',
    contact: { name: '', email: '', phone: '' }
  });

  const disposalItems = [
    { id: 'furniture', label: 'Furniture', icon: '🪑' },
    { id: 'appliances', label: 'Appliances', icon: '🔌' },
    { id: 'electronics', label: 'Electronics', icon: '📺' },
    { id: 'mattress', label: 'Mattress', icon: '🛏️' },
    { id: 'cardboard', label: 'Cardboard', icon: '📦' },
    { id: 'metal', label: 'Metal', icon: '🔩' },
    { id: 'wood', label: 'Wood', icon: '🪵' },
    { id: 'other', label: 'Other', icon: '🗑️' },
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = () => {
    console.log('Disposal request:', { selectedItems, formData });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('disposal.title')}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">{t('disposal.selectItems')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {disposalItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={cn(
                  "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-center",
                  selectedItems.includes(item.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-medium mb-4">{t('disposal.uploadPhoto')}</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Tap to upload photos of items to dispose
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-medium">{t('disposal.address')}</h3>
          </div>
          <Input
            placeholder="Enter pickup address"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </CardContent>
      </Card>

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

          <div className="space-y-2">
            <Label htmlFor="notes">{t('common.notes')}</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
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

export default Disposal;
