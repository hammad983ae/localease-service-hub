
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Trash2, Car, Sparkles, TreePine, ArrowRight, Shield, Clock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const features = [
    {
      icon: Shield,
      title: 'Trusted & Insured',
      description: 'All our partners are fully licensed and insured'
    },
    {
      icon: Clock,
      title: 'Quick Response',
      description: 'Get quotes within minutes, service within hours'
    },
    {
      icon: Star,
      title: 'Top Quality',
      description: '4.9+ rating from thousands of satisfied customers'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                LocalEase
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your trusted partner for all home services. Professional, reliable, and just a tap away.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <feature.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
            <Button variant="ghost" className="text-primary hover:bg-primary/10">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                {...service}
                onClick={() => handleServiceClick(service)}
              />
            ))}
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h3 className="text-2xl font-bold mb-3">Ready to get started?</h3>
              <p className="text-lg opacity-90 mb-6 max-w-md mx-auto">
                Choose a service above and get your first quote in minutes. Join thousands of satisfied customers!
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm opacity-75">
                <span>⭐ 4.9+ Rating</span>
                <span>•</span>
                <span>🚀 Quick Service</span>
                <span>•</span>
                <span>🛡️ Fully Insured</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
