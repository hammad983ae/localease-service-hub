
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Trash2, Car, Sparkles, TreePine, CheckCircle, Star, Users } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Truck,
      title: 'Moving Services',
      description: 'Professional moving with expert teams',
      color: 'text-blue-600'
    },
    {
      icon: Trash2,
      title: 'Disposal Services',
      description: 'Eco-friendly junk removal',
      color: 'text-green-600'
    },
    {
      icon: Car,
      title: 'Transport Services',
      description: 'Quick delivery & transportation',
      color: 'text-purple-600'
    },
    {
      icon: Sparkles,
      title: 'Cleaning Services',
      description: 'Deep cleaning & maintenance',
      color: 'text-yellow-600'
    },
  ];

  const features = [
    {
      icon: CheckCircle,
      title: 'Professional Teams',
      description: 'Experienced and skilled service providers'
    },
    {
      icon: Star,
      title: 'Quality Assured',
      description: 'Top-rated services with guaranteed satisfaction'
    },
    {
      icon: Users,
      title: '24/7 Support',
      description: 'Round-the-clock customer assistance'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-lg mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">L</span>
                </div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Welcome to <span className="text-primary">LocalEase</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Your one-stop solution for all home services. Professional, reliable, and affordable services at your fingertips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="px-8 py-4 text-lg font-semibold border-2 hover:bg-primary hover:text-white transition-all duration-300"
                  size="lg"
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600">Everything you need for your home, delivered with excellence</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6 text-center">
                <service.icon className={`h-12 w-12 mx-auto mb-4 ${service.color}`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose LocalEase?</h2>
            <p className="text-xl text-gray-600">We're committed to delivering the best service experience</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of satisfied customers today</p>
          <Button 
            onClick={() => navigate('/auth')}
            variant="secondary"
            className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            Start Your Journey
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="w-12 h-12 mx-auto bg-primary rounded-lg flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-white">L</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">LocalEase</h3>
            <p className="text-gray-400">Your trusted partner for home services</p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">&copy; 2024 LocalEase. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
