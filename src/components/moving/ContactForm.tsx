
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';

interface ContactFormProps {
  data: { name: string; email: string; phone: string; notes: string };
  onUpdate: (contact: { name: string; email: string; phone: string; notes: string }) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();

  const handleChange = (field: string, value: string) => {
    onUpdate({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">{t('common.name')}</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('common.email')}</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('common.phone')}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">{t('common.notes')}</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes or special requirements"
            value={data.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
