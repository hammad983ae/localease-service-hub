
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  route: string;
  available: boolean;
  onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon: Icon,
  label,
  description,
  color,
  available,
  onClick
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 relative overflow-hidden",
        available ? "hover:bg-muted/30" : "opacity-60 cursor-not-allowed"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col items-start space-y-3">
        <div className={cn("p-3 rounded-full", color)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-sm">{label}</h3>
            {!available && (
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
