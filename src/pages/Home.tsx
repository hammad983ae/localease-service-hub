
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Zap,
  Shield,
  Clock,
  MapPin,
  Truck,
  Package,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Bookings',
      value: '1,234',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Users',
      value: '8,567',
      change: '+8.2%',
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      change: '+2.1%',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const services = [
    {
      title: 'Moving Service',
      description: 'Professional moving services with full packing and unpacking',
      icon: Truck,
      features: ['Full packing service', 'Insurance included', 'Same-day delivery'],
      gradient: 'from-blue-500 to-blue-600',
      href: '/moving'
    },
    {
      title: 'Disposal Service',
      description: 'Eco-friendly waste disposal and recycling solutions',
      icon: Trash2,
      features: ['Eco-friendly disposal', 'Recycling included', 'Same-day pickup'],
      gradient: 'from-green-500 to-green-600',
      href: '/disposal'
    },
    {
      title: 'Transport Service',
      description: 'Reliable transportation for all your delivery needs',
      icon: Package,
      features: ['Real-time tracking', 'Insurance coverage', 'Express delivery'],
      gradient: 'from-purple-500 to-purple-600',
      href: '/transport'
    }
  ];

  const features = [
    {
      title: 'Lightning Fast',
      description: 'Get quotes in minutes, not hours',
      icon: Zap,
      color: 'text-yellow-500'
    },
    {
      title: 'Secure & Reliable',
      description: 'Your data is protected with enterprise-grade security',
      icon: Shield,
      color: 'text-blue-500'
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support when you need it',
      icon: Clock,
      color: 'text-green-500'
    },
    {
      title: 'Local Experts',
      description: 'Trusted local service providers in your area',
      icon: MapPin,
      color: 'text-purple-500'
    }
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
      <Seo title="LocalEase | Home" description="LocalEase — moving, disposal, and transport services in a modern SaaS experience." />
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
                onClick={() => navigate('/moving')}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="btn-secondary text-lg px-8 py-4"
                onClick={() => navigate('/bookings')}
              >
                View Bookings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-muted/30">
        <div className="container-modern">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="stats-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
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
                onClick={() => navigate(service.href)}
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
                      onClick={() => navigate(service.href)}
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
                  onClick={() => navigate('/moving')}
                >
                  Start Your Booking
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="btn-secondary text-lg px-8 py-4"
                  onClick={() => navigate('/chats')}
                >
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;
