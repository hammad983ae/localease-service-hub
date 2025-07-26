import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Truck, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ServiceCard from '../components/ServiceCard';
import RecentBookingCard from '../components/RecentBookingCard';
import HomeStats from '../components/HomeStats';
import ChatBot from '@/components/ChatBot';

const Home = () => {
  const { t } = useLanguage();

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
            <ServiceCard
              title={t('home.movingService')}
              description={t('home.movingDescription')}
              icon={<Truck className="h-6 w-6" />}
              link="/moving"
            />
            <ServiceCard
              title={t('home.disposalService')}
              description={t('home.disposalDescription')}
              icon={<Trash2 className="h-6 w-6" />}
              link="/disposal"
            />
            <ServiceCard
              title={t('home.transportService')}
              description={t('home.transportDescription')}
              icon={<Package className="h-6 w-6" />}
              link="/transport"
            />
          </div>
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="py-12 bg-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-center mb-8">{t('home.recentBookingsTitle')}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentBookingCard
              serviceType="Moving"
              date="2024-03-15"
              status="Confirmed"
              details="Apartment moving from downtown to suburbs"
            />
            <RecentBookingCard
              serviceType="Disposal"
              date="2024-03-20"
              status="Pending"
              details="Old furniture disposal after renovation"
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
