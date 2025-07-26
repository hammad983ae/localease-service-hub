
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Truck, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ServiceCard from '../components/ServiceCard';
import RecentBookingCard from '../components/RecentBookingCard';
import HomeStats from '../components/HomeStats';
import ChatBot from '@/components/ChatBot';

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const services = [
    {
      id: 'moving',
      icon: Truck,
      label: t('home.movingService'),
      description: t('home.movingDescription'),
      color: 'bg-blue-50 text-blue-600',
      route: '/moving',
      available: true,
    },
    {
      id: 'disposal',
      icon: Trash2,
      label: t('home.disposalService'),
      description: t('home.disposalDescription'),
      color: 'bg-red-50 text-red-600',
      route: '/disposal',
      available: true,
    },
    {
      id: 'transport',
      icon: Package,
      label: t('home.transportService'),
      description: t('home.transportDescription'),
      color: 'bg-green-50 text-green-600',
      route: '/transport',
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            {t('home.heroTitle')}
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl mb-8">
            {t('home.heroSubtitle')}
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg">
              <Link to="/moving">{t('home.getStartedButton')}<ArrowRight className="ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-8">{t('home.servicesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                id={service.id}
                icon={service.icon}
                label={service.label}
                description={service.description}
                color={service.color}
                route={service.route}
                available={service.available}
                onClick={() => navigate(service.route)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="py-12 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-8">{t('home.recentBookingsTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentBookingCard
              booking={{
                id: "1",
                service_type: "moving",
                status: "confirmed",
                created_at: "2024-03-15T10:00:00Z"
              }}
            />
            <RecentBookingCard
              booking={{
                id: "2", 
                service_type: "disposal",
                status: "pending",
                created_at: "2024-03-20T14:30:00Z"
              }}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <HomeStats />
        </div>
      </section>
      
      {/* Add ChatBot component */}
      <ChatBot userType="customer" />
    </div>
  );
};

export default Home;
