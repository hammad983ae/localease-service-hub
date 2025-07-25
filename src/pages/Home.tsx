
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Trash2, Car, Sparkles, TreePine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import ServiceCard from '@/components/ServiceCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'moving',
      icon: Truck,
      label: 'Moving',
      description: 'Professional moving services with expert teams',
      color: 'bg-blue-50 text-blue-600',
      route: '/moving',
      available: true
    },
    {
      id: 'disposal',
      icon: Trash2,
      label: 'Disposal',
      description: 'Eco-friendly junk removal & disposal',
      color: 'bg-green-50 text-green-600',
      route: '/disposal',
      available: true
    },
    {
      id: 'transport',
      icon: Car,
      label: 'Transport',
      description: 'Quick delivery & transportation service',
      color: 'bg-purple-50 text-purple-600',
      route: '/transport',
      available: true
    },
    {
      id: 'cleaning',
      icon: Sparkles,
      label: 'Cleaning',
      description: 'Deep cleaning & maintenance services',
      color: 'bg-yellow-50 text-yellow-600',
      route: '/cleaning',
      available: false
    },
    {
      id: 'gardening',
      icon: TreePine,
      label: 'Gardening',
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-8 text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to LocalEase!
          </h1>
          <p className="text-muted-foreground text-lg">
            Your one-stop solution for all home services
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Services Grid */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Our Services
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    {...service}
                    onClick={() => handleServiceClick(service)}
                  />
                ))}
              </div>
            </div>

            {/* Why Choose Us Section */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  Why choose our services?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      Professional and experienced teams
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      Transparent pricing with no hidden fees
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      Fully insured and licensed
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      24/7 customer support
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Get Started Card */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-100">
              <CardContent className="p-6 text-center">
                <Sparkles className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">Ready to get started?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a service above and get your first quote in minutes!
                </p>
                <div className="text-xs text-muted-foreground">
                  ⭐ Join thousands of satisfied customers
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-100">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-green-600" />
                  Quick Tips
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>💡 Book services in advance for better scheduling</p>
                  <p>📋 Prepare a detailed inventory for moving services</p>
                  <p>🏠 Clear pathways for easier service delivery</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
