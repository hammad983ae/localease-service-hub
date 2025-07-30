import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Package, MapPin, User, Phone, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface MovingQuoteFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const MovingQuoteForm: React.FC<MovingQuoteFormProps> = ({ onSubmit, initialData }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fromAddress: initialData?.addresses?.from || '',
    toAddress: initialData?.addresses?.to || '',
    moveDate: initialData?.dateTime ? new Date(initialData.dateTime) : null,
    moveType: '',
    rooms: '',
    items: '',
    name: initialData?.contact?.name || '',
    email: initialData?.contact?.email || '',
    phone: initialData?.contact?.phone || '',
    notes: initialData?.contact?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Addresses */}
        <div className="space-y-2">
          <Label htmlFor="fromAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('moving.fromAddress') || 'From Address'}
          </Label>
          <Input
            id="fromAddress"
            value={formData.fromAddress}
            onChange={(e) => handleInputChange('fromAddress', e.target.value)}
            placeholder="Enter your current address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAddress" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {t('moving.toAddress') || 'To Address'}
          </Label>
          <Input
            id="toAddress"
            value={formData.toAddress}
            onChange={(e) => handleInputChange('toAddress', e.target.value)}
            placeholder="Enter your new address"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Move Date */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {t('moving.moveDate') || 'Move Date'}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                {formData.moveDate ? (
                  format(formData.moveDate, 'PPP')
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.moveDate}
                onSelect={(date) => handleInputChange('moveDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Move Type */}
        <div className="space-y-2">
          <Label htmlFor="moveType" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            {t('moving.moveType') || 'Move Type'}
          </Label>
          <Select value={formData.moveType} onValueChange={(value) => handleInputChange('moveType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select move type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential Move</SelectItem>
              <SelectItem value="commercial">Commercial Move</SelectItem>
              <SelectItem value="international">International Move</SelectItem>
              <SelectItem value="storage">Storage Move</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rooms */}
        <div className="space-y-2">
          <Label htmlFor="rooms">{t('moving.rooms') || 'Number of Rooms'}</Label>
          <Input
            id="rooms"
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
            placeholder="e.g., 3"
            min="1"
          />
        </div>

        {/* Items */}
        <div className="space-y-2">
          <Label htmlFor="items">{t('moving.items') || 'Major Items'}</Label>
          <Input
            id="items"
            value={formData.items}
            onChange={(e) => handleInputChange('items', e.target.value)}
            placeholder="e.g., sofa, bed, fridge"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <User className="h-4 w-4" />
          {t('moving.contactInfo') || 'Contact Information'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('moving.name') || 'Full Name'}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              {t('moving.email') || 'Email'}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {t('moving.phone') || 'Phone Number'}
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t('moving.notes') || 'Additional Notes'}</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any special requirements or additional information..."
            rows={3}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">
        {t('moving.getQuote') || 'Get Moving Quote'}
      </Button>
    </form>
  );
};

export default MovingQuoteForm; 