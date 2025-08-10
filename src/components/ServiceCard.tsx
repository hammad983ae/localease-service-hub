
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
        "service-card cursor-pointer group",
        available 
          ? "hover-lift" 
          : "opacity-60 cursor-not-allowed grayscale"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center space-y-4 text-center">
        <div className={cn(
          "relative p-4 rounded-xl transition-all duration-200",
          available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h3 className={cn(
              "font-semibold text-lg transition-all duration-200",
              available ? "text-foreground" : "text-muted-foreground"
            )}>
              {label}
            </h3>
            {!available && (
              <Badge variant="secondary" className="text-xs">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Hover effect */}
        {available && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
