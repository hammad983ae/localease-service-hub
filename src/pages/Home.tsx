import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Trash2, Car, Sparkles, TreePine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();

  // Fetch user profile to get the full name
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  // Fetch recent bookings
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['recent-bookings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('moving_bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      return data || [];
    },
    enabled: !!user,
  });

  const services = [
    {
      id: 'moving',
      icon: Truck,
      label: t('service.moving'),
      description: 'Professional moving services',
      color: 'bg-blue-50 text-blue-600',
      route: '/moving',
      available: true
    },
    {
      id: 'disposal',
      icon: Trash2,
      label: t('service.disposal'),
      description: 'Junk removal & disposal',
      color: 'bg-green-50 text-green-600',
      route: '/disposal',
      available: true
    },
    {
      id: 'transport',
      icon: Car,
      label: t('service.transport'),
      description: 'Quick delivery service',
      color: 'bg-purple-50 text-purple-600',
      route: '/transport',
      available: true
    },
    {
      id: 'cleaning',
      icon: Sparkles,
      label: t('service.cleaning'),
      description: 'Professional cleaning',
      color: 'bg-yellow-50 text-yellow-600',
      route: '/cleaning',
      available: false
    },
    {
      id: 'gardening',
      icon: TreePine,
      label: t('service.gardening'),
      description: 'Garden maintenance & landscaping',
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const firstName = userName.split(' ')[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Greeting Section */}
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Hello, {firstName}!
        </h1>
        <p className="text-muted-foreground">
          What service do you need today?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className={cn(
                  "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105",
                  service.available ? "hover:bg-muted/30" : "opacity-60 cursor-not-allowed"
                )}
                onClick={() => handleServiceClick(service)}
              >
                <CardContent className="p-4 sm:p-6 flex flex-col items-start space-y-3">
                  <div className={cn("p-3 rounded-full", service.color)}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-sm">{service.label}</h3>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Bookings Section */}
        <div className="lg:col-span-1">
          {recentBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Bookings</h2>
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 rounded-full bg-green-50">
                          <Sparkles className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm capitalize">
                            {booking.service_type} Service
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(booking.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getStatusColor(booking.status))}
                      >
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {recentBookings.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <h3 className="font-medium text-foreground mb-1">No bookings yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start by selecting a service above
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
