
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    label: string;
    icon: string;
    color: string;
  };
  count: number;
  onUpdate: (itemId: string, count: number) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, count, onUpdate }) => {
  const handleIncrement = () => onUpdate(item.id, count + 1);
  const handleDecrement = () => onUpdate(item.id, Math.max(0, count - 1));

  return (
    <div className="morphism-card rounded-xl p-3 hover:glow-effect transition-all duration-300 group relative overflow-hidden">
      {/* Liquid background effect */}
      <div className={cn("absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300", item.color)} />
      
      <div className="relative z-10 text-center">
        <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
          {item.icon}
        </div>
        
        <h4 className="text-xs font-medium mb-3 min-h-[2rem] flex items-center justify-center leading-tight">
          {item.label}
        </h4>
        
        <div className="item-counter">
          <Button
            variant="ghost"
            size="sm"
            className="liquid-glass w-6 h-6 p-0 hover:liquid-gradient-primary hover:text-white"
            onClick={handleDecrement}
            disabled={count === 0}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="w-6 text-center font-bold text-sm liquid-gradient-primary bg-clip-text text-transparent">
            {count}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            className="liquid-glass w-6 h-6 p-0 hover:liquid-gradient-primary hover:text-white"
            onClick={handleIncrement}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
