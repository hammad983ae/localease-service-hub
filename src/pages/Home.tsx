
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Trash2, Car, Sparkles, TreePine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const services = [
    {
      id: 'moving',
      icon: Truck,
      label: t('service.moving'),
      color: 'bg-blue-50 text-blue-600',
      route: '/moving',
      available: true
    },
    {
      id: 'disposal',
      icon: Trash2,
      label: t('service.disposal'),
      color: 'bg-green-50 text-green-600',
      route: '/disposal',
      available: true
    },
    {
      id: 'transport',
      icon: Car,
      label: t('service.transport'),
      color: 'bg-purple-50 text-purple-600',
      route: '/transport',
      available: true
    },
    {
      id: 'cleaning',
      icon: Sparkles,
      label: t('service.cleaning'),
      color: 'bg-yellow-50 text-yellow-600',
      route: '/cleaning',
      available: false
    },
    {
      id: 'gardening',
      icon: TreePine,
      label: t('service.gardening'),
      color: 'bg-emerald-50 text-emerald-600',
      route: '/gardening',
      available: false
    },
  ];

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.available) {
      navigate(service.route);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {t('home.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('home.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
              service.available ? "hover:bg-muted/30" : "opacity-60 cursor-not-allowed"
            )}
            onClick={() => handleServiceClick(service)}
          >
            <CardContent className="p-6 flex flex-col items-center space-y-4">
              <div className={cn("p-4 rounded-full", service.color)}>
                <service.icon className="h-8 w-8" />
              </div>
              <span className="font-medium text-center text-sm">
                {service.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
