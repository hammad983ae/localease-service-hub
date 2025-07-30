
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Trash2, Car, Sparkles, Shield, Clock, Star, ArrowRight, Zap, Globe, Users, Award } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Truck,
      title: 'Verhuizen',
      description: 'Professionele verhuisdiensten met ervaren teams',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Trash2,
      title: 'Afvalverwerking',
      description: 'Milieuvriendelijke ontruiming & afvalverwerking',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Car,
      title: 'Transport',
      description: 'Snelle bezorging & transportdiensten',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Sparkles,
      title: 'Schoonmaak',
      description: 'Diepgaande reiniging & onderhoudsdiensten',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Geavanceerde algoritmes matchen u met de beste dienstverleners'
    },
    {
      icon: Shield,
      title: 'Volledig Verzekerd',
      description: 'Alle partners zijn volledig gelicenseerd en verzekerd'
    },
    {
      icon: Globe,
      title: 'Landelijke Dekking',
      description: 'Dienstverlening in heel Nederland, 24/7 beschikbaar'
    },
  ];

  const stats = [
    { value: '50K+', label: 'Tevreden Klanten' },
    { value: '99.2%', label: 'Succes Rate' },
    { value: '<2min', label: 'Gemiddelde Respons' },
    { value: '4.9★', label: 'Klantbeoordeling' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
      {/* Modern Navigation */}
      <nav className="nav-futuristic sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">L</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                LocalEase
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/auth')}
                className="hover:bg-primary/10 font-medium"
              >
                Inloggen
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="btn-futuristic px-6 py-2 rounded-xl font-semibold"
              >
                Gratis Proberen
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern SaaS Style */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-600/5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-8">
            <Zap className="w-4 h-4 mr-2" />
            AI-Powered Platform voor Huishoudelijke Diensten
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            De Toekomst van
            <span className="block bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              Huishoudelijke Diensten
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Revolutionaire platform dat Nederlandse huishoudens verbindt met premiumdienstverleners. 
            Van verhuizen tot schoonmaak - alles op één intelligente plek.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-futuristic px-8 py-4 text-lg font-bold rounded-2xl"
              size="lg"
            >
              Start Gratis Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="px-8 py-4 text-lg font-semibold border-2 border-primary/20 hover:border-primary rounded-2xl bg-white/70 backdrop-blur-sm"
              size="lg"
            >
              Demo Bekijken
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid - Futuristic Cards */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Intelligente Dienstverlening
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-gedreven matching voor de perfecte dienstverlener bij elke klus
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="modern-card group cursor-pointer border-0">
                <CardContent className="p-8 text-center relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}>
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Waarom LocalEase?
            </h2>
            <p className="text-xl text-gray-600">
              De meest geavanceerde platform voor huishoudelijke diensten in Nederland
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Modern Glass Effect */}
      <section className="px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-primary"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Klaar voor de Toekomst?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Sluit je aan bij duizenden tevreden Nederlandse huishoudens
          </p>
          
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-white text-primary hover:bg-gray-100 px-10 py-4 text-lg font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            size="lg"
          >
            Begin Nu - Gratis
            <ArrowRight className="w-5 h-5 ml-3" />
          </Button>
          
          <div className="mt-8 text-white/80 text-sm">
            ✓ Geen verborgen kosten  ✓ 30 dagen geld terug garantie  ✓ Premium support
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="mb-8">
            <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-xl font-bold text-white">L</span>
            </div>
            <h3 className="text-2xl font-bold mb-2">LocalEase</h3>
            <p className="text-gray-400">De slimste keuze voor huishoudelijke diensten</p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">&copy; 2024 LocalEase. Alle rechten voorbehouden.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
