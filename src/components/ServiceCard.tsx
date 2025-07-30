
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
        "cursor-pointer transition-all duration-500 futuristic-card group relative",
        available 
          ? "hover:scale-105 hover:shadow-2xl neon-border border-primary/20 hover:border-primary/60" 
          : "opacity-60 cursor-not-allowed grayscale"
      )}
      onClick={onClick}
    >
      {/* Animated background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <CardContent className="relative p-6 flex flex-col items-center space-y-4 text-center">
        <div className={cn(
          "relative p-4 rounded-2xl transition-all duration-300 group-hover:scale-110",
          available ? "gradient-primary glow-primary" : "bg-muted"
        )}>
          <Icon className="h-8 w-8 text-white" />
          {available && (
            <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse-glow" />
          )}
        </div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h3 className={cn(
              "font-semibold text-lg transition-all duration-300",
              available ? "text-foreground group-hover:holographic-text" : "text-muted-foreground"
            )}>
              {label}
            </h3>
            {!available && (
              <Badge variant="secondary" className="text-xs bg-muted/50 neon-border border-muted">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Hover effect */}
        {available && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
