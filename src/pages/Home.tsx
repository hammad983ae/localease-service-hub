
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Trash2, Car, Sparkles, TreePine, ArrowRight, Shield, Clock, Star, Zap, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/ServiceCard';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'moving',
      icon: Truck,
      label: 'Verhuizen',
      description: 'AI-gestuurde verhuisdiensten met premiumteams',
      color: 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white',
      route: '/moving',
      available: true
    },
    {
      id: 'disposal',
      icon: Trash2,
      label: 'Afvalservice',
      description: 'Slimme & milieuvriendelijke afvalverwerking',
      color: 'bg-gradient-to-br from-green-500 to-emerald-500 text-white',
      route: '/disposal',
      available: true
    },
    {
      id: 'transport',
      icon: Car,
      label: 'Transport',
      description: 'Snelle bezorging & logistieke diensten',
      color: 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white',
      route: '/transport',
      available: true
    },
    {
      id: 'cleaning',
      icon: Sparkles,
      label: 'Schoonmaak',
      description: 'Premium schoonmaak & onderhoudsdiensten',
      color: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white',
      route: '/cleaning',
      available: false
    },
    {
      id: 'gardening',
      icon: TreePine,
      label: 'Tuinservice',
      description: 'Professioneel tuinonderhoud & landscaping',
      color: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white',
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
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Intelligente koppeling aan perfecte dienstverleners'
    },
    {
      icon: TrendingUp,
      title: 'Real-time Tracking',
      description: 'Live updates en transparante communicatie'
    },
    {
      icon: Award,
      title: 'Premium Kwaliteit',
      description: '4.9+ beoordeling van duizenden klanten'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Modern Stats */}
      <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6 mb-10">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Huishoudelijke Diensten
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Welkom bij de{' '}
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                Toekomst
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Slimme technologie ontmoet Nederlandse kwaliteit. Alles wat je nodig hebt voor je huis, 
              op één intelligent platform.
            </p>
          </div>

          {/* Enhanced Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {features.map((feature, index) => (
              <Card key={index} className="modern-card group border-0 overflow-hidden">
                <CardContent className="p-6 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Services Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Premium Diensten</h2>
              <p className="text-gray-600">Ontdek onze intelligente dienstverlening</p>
            </div>
            <Button variant="ghost" className="text-primary hover:bg-primary/10 rounded-xl">
              Alle Diensten
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <Card
                key={service.id}
                className="modern-card group cursor-pointer border-0 overflow-hidden relative"
                onClick={() => handleServiceClick(service)}
              >
                <CardContent className="p-0">
                  <div className={`${service.color} p-8 relative overflow-hidden`}>
                    <div className="absolute top-2 right-2">
                      {service.available ? (
                        <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg animate-pulse"></div>
                      ) : (
                        <div className="px-2 py-1 bg-black/20 rounded-full text-xs text-white/80">
                          Binnenkort
                        </div>
                      )}
                    </div>
                    
                    <service.icon className="h-12 w-12 mb-4 drop-shadow-lg" />
                    <h3 className="text-xl font-bold mb-2">{service.label}</h3>
                    <p className="text-sm opacity-90 leading-relaxed">{service.description}</p>
                    
                    {service.available && (
                      <div className="mt-4 flex items-center text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                        Ontdek meer
                        <ArrowRight className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium CTA */}
          <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-8 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 opacity-50"></div>
              <div className="relative z-10">
                <Sparkles className="h-16 w-16 mx-auto mb-6 text-primary animate-pulse" />
                <h3 className="text-3xl font-bold mb-4">Ervaar de Toekomst Vandaag</h3>
                <p className="text-lg opacity-90 mb-8 max-w-md mx-auto leading-relaxed">
                  Kies een dienst hierboven en ontvang binnen minuten je eerste offerte. 
                  Sluit je aan bij duizenden tevreden Nederlandse klanten!
                </p>
                <div className="flex flex-wrap justify-center gap-6 text-sm opacity-75">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    <span>4.9+ Beoordeling</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-1 text-green-400" />
                    <span>Volledig Verzekerd</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-400" />
                    <span>24/7 Beschikbaar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
