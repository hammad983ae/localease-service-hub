
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { User, Mail, Phone, MapPin, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('nav.profile')}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('common.name')}</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t('common.email')}</Label>
            <Input id="email" type="email" placeholder="john@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t('common.phone')}</Label>
            <Input id="phone" type="tel" placeholder="+1 234 567 8900" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t('common.address')}</Label>
            <Input id="address" placeholder="123 Main St, City, Country" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Notification Preferences
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <MapPin className="h-4 w-4 mr-2" />
            Saved Addresses
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Contacts
          </Button>
        </CardContent>
      </Card>

      <Button className="w-full">
        {t('common.save')}
      </Button>
    </div>
  );
};

export default Profile;
