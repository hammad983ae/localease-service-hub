
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Trash2, Car, Sparkles, TreePine, CheckCircle, Star, Users, ArrowRight, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Truck,
      title: 'Moving Services',
      description: 'AI-powered moving with expert teams and predictive logistics',
      color: 'gradient-primary'
    },
    {
      icon: Trash2,
      title: 'Disposal Services',
      description: 'Smart eco-friendly disposal with automated sorting',
      color: 'gradient-primary'
    },
    {
      icon: Car,
      title: 'Transport Services',
      description: 'Quantum-fast delivery with real-time tracking',
      color: 'gradient-primary'
    },
    {
      icon: Sparkles,
      title: 'Cleaning Services',
      description: 'Nano-tech deep cleaning with molecular precision',
      color: 'gradient-primary'
    },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms match you with perfect service providers'
    },
    {
      icon: Star,
      title: 'Quality Quantum',
      description: 'Quantum-secured quality assurance with 99.9% satisfaction'
    },
    {
      icon: Users,
      title: 'Neural Support',
      description: 'AI-enhanced 24/7 support with predictive assistance'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background relative overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 cyber-grid opacity-20" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center animate-slide-up">
            <div className="mb-12">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="absolute inset-0 gradient-primary rounded-3xl shadow-2xl glow-primary animate-pulse-glow" />
                <div className="relative w-32 h-32 gradient-primary rounded-3xl flex items-center justify-center shadow-2xl">
                  <span className="text-4xl font-bold text-white">L</span>
                </div>
                <div className="absolute -inset-2 gradient-primary rounded-3xl opacity-30 animate-pulse" />
              </div>
              
              <h1 className="text-7xl font-bold text-foreground mb-8 leading-tight">
                Welcome to{' '}
                <span className="holographic-text block mt-2">LocalEase</span>
              </h1>
              
              <p className="text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                The future of home services is here. Experience AI-powered, quantum-fast solutions 
                that transform how you manage your home needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={() => navigate('/auth')}
                  className="px-12 py-6 text-xl font-semibold rounded-2xl gradient-primary glow-primary hover:scale-105 transition-all duration-300 group relative overflow-hidden"
                  size="lg"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    Launch Experience
                    <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="px-12 py-6 text-xl font-semibold rounded-2xl neon-border border-primary/50 hover:border-primary bg-transparent hover:bg-primary/10 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  Access Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-20 animate-slide-up">
          <h2 className="text-5xl font-bold text-foreground mb-6 holographic-text">
            Next-Gen Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powered by advanced AI and quantum computing for unparalleled efficiency
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="futuristic-card group hover:scale-105 transition-all duration-500 neon-border border-primary/20 hover:border-primary/60">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
                
                <div className={`relative w-16 h-16 mx-auto mb-6 rounded-2xl ${service.color} flex items-center justify-center glow-primary group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                  <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:holographic-text transition-all duration-300">
                  {service.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {service.description}
                </p>
                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 glass-effect py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-5xl font-bold text-foreground mb-6 holographic-text">
              Why Choose LocalEase?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the quantum leap in service excellence
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center group animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <div className="relative w-24 h-24 mx-auto mb-8">
                  <div className="absolute inset-0 gradient-primary rounded-2xl glow-primary animate-pulse-glow group-hover:scale-110 transition-transform duration-300" />
                  <div className="relative w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4 group-hover:holographic-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed group-hover:text-foreground transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 gradient-primary py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-slide-up">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to Enter the Future?
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join millions of satisfied users in the next generation of home services
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              variant="secondary"
              className="px-12 py-6 text-xl font-semibold rounded-2xl bg-white text-primary hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300 group relative overflow-hidden"
              size="lg"
            >
              <span className="relative z-10 flex items-center gap-3">
                Begin Journey
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-card/90 backdrop-blur-md border-t border-border/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 gradient-primary rounded-xl glow-primary" />
              <div className="relative w-16 h-16 gradient-primary rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">L</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold mb-4 holographic-text">LocalEase</h3>
            <p className="text-muted-foreground text-lg">Your quantum partner for home services</p>
          </div>
          <div className="border-t border-border/50 pt-8">
            <p className="text-muted-foreground">&copy; 2024 LocalEase. All rights reserved. Powered by quantum innovation.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
