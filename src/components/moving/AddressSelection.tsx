
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddressSelectionProps {
  data: {
    from: string;
    to: string;
  };
  onUpdate: (addresses: { from: string; to: string }) => void;
}

const AddressSelection: React.FC<AddressSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();

  const handleFromChange = (value: string) => {
    onUpdate({ ...data, from: value });
  };

  const handleToChange = (value: string) => {
    onUpdate({ ...data, to: value });
  };



  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-green-600" />
            <Label className="font-medium">{t('moving.from')}</Label>
          </div>
          <Input
            placeholder="Enter pickup address"
            value={data.from}
            onChange={(e) => handleFromChange(e.target.value)}
            className="text-base"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-red-600" />
            <Label className="font-medium">{t('moving.to')}</Label>
          </div>
          <Input
            placeholder="Enter destination address"
            value={data.to}
            onChange={(e) => handleToChange(e.target.value)}
            className="text-base"
          />
        </CardContent>
      </Card>

      <div className="bg-muted rounded-lg p-4">
        <div className="aspect-video bg-background rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">Interactive map will show here</p>
            <p className="text-xs">Enter the addresses manually in the input fields above</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelection;
