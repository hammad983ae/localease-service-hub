
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Seo from '@/components/Seo';
import { Truck, Trash2, Car, CheckCircle, Star, Users, ArrowRight, Zap, Shield, Clock, MapPin } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Truck,
      title: 'Moving Services',
      description: 'Professional moving with expert teams and full-service packing',
      features: ['Full packing service', 'Insurance included', 'Same-day delivery'],
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: Trash2,
      title: 'Disposal Services',
      description: 'Eco-friendly waste disposal with automated sorting and recycling',
      features: ['Eco-friendly disposal', 'Recycling included', 'Same-day pickup'],
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Car,
      title: 'Transport Services',
      description: 'Fast delivery with real-time tracking and secure handling',
      features: ['Real-time tracking', 'Insurance coverage', 'Express delivery'],
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Get quotes in minutes, not hours',
      color: 'text-yellow-500'
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security',
      color: 'text-blue-500'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer support when you need it',
      color: 'text-green-500'
    },
    {
      icon: MapPin,
      title: 'Local Experts',
      description: 'Trusted local service providers in your area',
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Happy Customers', icon: Users },
    { value: '99.8%', label: 'Success Rate', icon: CheckCircle },
    { value: '< 2 hours', label: 'Response Time', icon: Clock },
    { value: '4.9★', label: 'Average Rating', icon: Star }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'Amazing service! They moved my entire house in just one day.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Business Owner',
      content: 'Professional, reliable, and affordable. Highly recommended!',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Student',
      content: 'Perfect for my apartment move. Quick and efficient service.',
      rating: 5
    }
  ];

  return (
    <>
      <Seo title="LocalEase | Local service hub" description="Book moving, disposal, and transport services with a polished SaaS experience." />
      <div className="saas-layout">
      {/* Hero Section */}
      <section className="hero-section section-padding">
        <div className="container-modern">
          <div className="text-center space-y-8">
            <Badge className="badge-primary animate-bounce-in">
              <Star className="w-3 h-3 mr-1" />
              Trusted by 10,000+ customers
            </Badge>
            
            <div className="space-y-6">
              <h1 className="text-gradient text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                Your Local Service
                <br />
                <span className="text-gradient-secondary">Hub</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Connect with trusted local service providers for moving, disposal, and transport. 
                Get instant quotes and book services with confidence.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="btn-primary text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-secondary text-lg px-8 py-4"
                onClick={() => navigate('/auth')}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-modern">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="stats-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from our comprehensive range of local services designed to make your life easier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className="service-card animate-scale-in cursor-pointer hover-lift" 
                style={{ animationDelay: `${index * 0.2}s` }}
                onClick={() => navigate('/auth')}
              >
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${service.gradient} flex items-center justify-center text-white`}>
                      <service.icon className="h-8 w-8" />
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                    </div>

                    <div className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full btn-primary"
                      onClick={() => navigate('/auth')}
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">
              Why Choose Us
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're committed to providing the best local service experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="saas-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center space-y-4">
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section-padding">
        <div className="container-modern">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient">
              What Our Customers Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="saas-card animate-slide-up" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                  
                  <div className="space-y-1">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container-modern">
          <Card className="saas-card-hero">
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gradient">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust us with their local service needs
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="btn-primary text-lg px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="btn-secondary text-lg px-8 py-4"
                  onClick={() => navigate('/auth')}
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-padding bg-muted/30">
        <div className="container-modern">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gradient">LocalEase</h3>
                <p className="text-sm text-muted-foreground">Service Hub</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold">Services</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Moving</p>
                  <p>Disposal</p>
                  <p>Transport</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Company</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>About</p>
                  <p>Careers</p>
                  <p>Contact</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Support</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Help Center</p>
                  <p>Live Chat</p>
                  <p>FAQ</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Legal</h4>
                <div className="space-y-1 text-muted-foreground">
                  <p>Privacy</p>
                  <p>Terms</p>
                  <p>Security</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border/50 pt-8">
              <p className="text-muted-foreground">&copy; 2024 LocalEase. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
};

export default Landing;
