
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Minus } from 'lucide-react';

interface ItemSelectionProps {
  data: any;
  onUpdate: (items: any) => void;
}

const ItemSelection: React.FC<ItemSelectionProps> = ({ data, onUpdate }) => {
  const { t } = useLanguage();

  const items = [
    { id: 'sofa', label: t('item.sofa'), icon: '🛋️' },
    { id: 'table', label: t('item.table'), icon: '🪑' },
    { id: 'chair', label: t('item.chair'), icon: '🪑' },
    { id: 'bed', label: t('item.bed'), icon: '🛏️' },
    { id: 'wardrobe', label: t('item.wardrobe'), icon: '👗' },
    { id: 'tv', label: t('item.tv'), icon: '📺' },
    { id: 'fridge', label: t('item.fridge'), icon: '❄️' },
    { id: 'washer', label: t('item.washer'), icon: '🧺' },
  ];

  const getItemCount = (itemId: string) => {
    return data[itemId] || 0;
  };

  const updateItemCount = (itemId: string, count: number) => {
    const newData = { ...data };
    if (count > 0) {
      newData[itemId] = count;
    } else {
      delete newData[itemId];
    }
    onUpdate(newData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">
          Select the items you need to move
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => {
          const count = getItemCount(item.id);
          return (
            <Card key={item.id} className="relative">
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-sm font-medium mb-3">{item.label}</div>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateItemCount(item.id, Math.max(0, count - 1))}
                    disabled={count === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{count}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateItemCount(item.id, count + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ItemSelection;
