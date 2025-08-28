import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  Truck,
  Package,
  Trash2,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Filter,
  Home,
  Building,
  Recycle,
  Clock,
  Car,
  Users,
  Wrench,
  Leaf,
  Sparkles,
  Warehouse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Seo from '@/components/Seo';
import { apiClient } from '@/api/client';

interface Company {
  _id: string;
  name: string;
  description: string;
  services: string[];
  priceRange: string;
  address: string;
  phone: string;
  email: string;
  rating?: number;
}

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const services = [
    {
      title: 'Moving Services',
      description: 'Professional moving services with full packing and unpacking',
      icon: Truck,
      gradient: 'from-blue-500 to-blue-600',
      href: '/moving',
      serviceType: 'moving',
      subServices: [
        { name: 'Local Moving', icon: Truck, description: 'Same city and local area moves' },
        { name: 'Long Distance Moving', icon: Truck, description: 'Cross-country and interstate moves' },
        { name: 'Office Moving', icon: Building, description: 'Commercial and office relocations' },
        { name: 'Packing Services', icon: Package, description: 'Professional packing and unpacking' },
        { name: 'Storage Solutions', icon: Warehouse, description: 'Temporary and long-term storage' },
        { name: 'Furniture Assembly', icon: Wrench, description: 'Furniture setup and assembly' }
      ]
    },
    {
      title: 'Disposal Services',
      description: 'Eco-friendly waste disposal and recycling solutions',
      icon: Trash2,
      gradient: 'from-green-500 to-green-600',
      href: '/disposal',
      serviceType: 'disposal',
      subServices: [
        { name: 'Household Junk', icon: Home, description: 'Furniture, appliances, and general items' },
        { name: 'Construction Debris', icon: Building, description: 'Renovation waste and building materials' },
        { name: 'Electronic Waste', icon: Recycle, description: 'Computers, TVs, phones, and devices' },
        { name: 'Yard Waste', icon: Leaf, description: 'Branches, leaves, and garden debris' }
      ]
    },
    {
      title: 'Transport Services',
      description: 'Reliable transportation for all your delivery needs',
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      href: '/transport',
      serviceType: 'transport',
      subServices: [
        { name: 'Small Item Delivery', icon: Package, description: 'Documents, packages, and small items' },
        { name: 'Furniture Transport', icon: Truck, description: 'Single furniture pieces and large items' },
        { name: 'Same Day Delivery', icon: Clock, description: 'Urgent deliveries within the city' },
        { name: 'Scheduled Transport', icon: Car, description: 'Plan your delivery for specific time' }
      ]
    },
    {
      title: 'Cleaning Services',
      description: 'Professional cleaning for homes and offices',
      icon: Sparkles,
      gradient: 'from-pink-500 to-pink-600',
      href: '/cleaning',
      serviceType: 'cleaning',
      subServices: [
        { name: 'House Cleaning', icon: Home, description: 'Regular and deep house cleaning' },
        { name: 'Office Cleaning', icon: Building, description: 'Commercial and office cleaning' },
        { name: 'Post-Move Cleaning', icon: Truck, description: 'Cleaning after moving out' },
        { name: 'Specialty Cleaning', icon: Sparkles, description: 'Carpet, window, and upholstery' }
      ]
    },
    {
      title: 'Storage Solutions',
      description: 'Secure storage facilities for all your needs',
      icon: Warehouse,
      gradient: 'from-orange-500 to-orange-600',
      href: '/storage',
      serviceType: 'storage',
      subServices: [
        { name: 'Self Storage', icon: Warehouse, description: 'Personal storage units' },
        { name: 'Climate Controlled', icon: Home, description: 'Temperature-regulated storage' },
        { name: 'Vehicle Storage', icon: Car, description: 'Car, boat, and RV storage' },
        { name: 'Business Storage', icon: Building, description: 'Commercial storage solutions' }
      ]
    },
    {
      title: 'Gardening Services',
      description: 'Landscaping and garden maintenance',
      icon: Leaf,
      gradient: 'from-emerald-500 to-emerald-600',
      href: '/gardening',
      serviceType: 'gardening',
      subServices: [
        { name: 'Lawn Maintenance', icon: Leaf, description: 'Mowing, edging, and lawn care' },
        { name: 'Landscaping', icon: Leaf, description: 'Design and installation' },
        { name: 'Tree Services', icon: Leaf, description: 'Trimming, removal, and care' },
        { name: 'Garden Design', icon: Leaf, description: 'Custom garden planning' }
      ]
    }
  ];

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, selectedService]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllCompanies();
      setCompanies(response.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filter by service type
    if (selectedService !== 'all') {
      filtered = filtered.filter(company =>
        company.services.some(service =>
          service.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.services.some(service =>
          service.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredCompanies(filtered);
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'moving':
        return Truck;
      case 'disposal':
        return Trash2;
      case 'transport':
        return Package;
      case 'cleaning':
        return Sparkles;
      case 'storage':
        return Warehouse;
      case 'gardening':
        return Leaf;
      default:
        return Package;
    }
  };

  const getServiceGradient = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'moving':
        return 'from-blue-500 to-blue-600';
      case 'disposal':
        return 'from-green-500 to-green-600';
      case 'transport':
        return 'from-purple-500 to-purple-600';
      case 'cleaning':
        return 'from-pink-500 to-pink-600';
      case 'storage':
        return 'from-orange-500 to-orange-600';
      case 'gardening':
        return 'from-emerald-500 to-emerald-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      <Seo 
        title="LocalEase | Discover Services" 
        description="Discover and connect with trusted local service providers for moving, disposal, transport, cleaning, storage, and gardening services." 
      />
      <div className="saas-layout">
        {/* Hero Section */}
        <section className="hero-section section-padding">
          <div className="container-modern">
            <div className="text-center space-y-8">
              <Badge className="badge-primary animate-bounce-in">
                <Search className="w-3 h-3 mr-1" />
                Discover Local Services
              </Badge>
              
              <div className="space-y-6">
                <h1 className="text-gradient text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                  Discover
                  <br />
                  <span className="text-gradient-secondary">Services</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Find and connect with trusted local service providers for all your needs. 
                  From moving and disposal to cleaning and gardening - we've got you covered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="section-padding bg-muted/30">
          <div className="container-modern">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search companies or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-lg"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant={selectedService === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedService('all')}
                  className="rounded-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  All Services
                </Button>
                {services.map((service) => (
                  <Button
                    key={service.serviceType}
                    variant={selectedService === service.serviceType ? 'default' : 'outline'}
                    onClick={() => setSelectedService(service.serviceType)}
                    className="rounded-full"
                  >
                    <service.icon className="w-4 h-4 mr-2" />
                    {service.title.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Types Section */}
        <section className="section-padding">
          <div className="container-modern">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient">
                All Service Categories
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose from our comprehensive range of local services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                      {/* Sub-services */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground">Available Services:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {service.subServices.slice(0, 3).map((subService, subIndex) => (
                            <div key={subIndex} className="flex items-center space-x-2 text-sm">
                              <subService.icon className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{subService.name}</span>
                            </div>
                          ))}
                          {service.subServices.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{service.subServices.length - 3} more services
                            </div>
                          )}
                        </div>
                      </div>

                      <Button 
                        className="w-full btn-primary"
                        onClick={() => navigate(service.href)}
                      >
                        View Companies
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Companies Section */}
        <section className="section-padding bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="container-modern">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gradient">
                Available Companies
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {filteredCompanies.length > 0 
                  ? `Found ${filteredCompanies.length} companies matching your criteria`
                  : 'No companies found matching your criteria'
                }
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading companies...</p>
              </div>
            ) : filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company, index) => (
                  <Card key={company._id} className="company-card animate-fade-in hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-xl font-bold">{company.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {company.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">{company.rating}</span>
                              </div>
                            )}
                            {company.priceRange && (
                              <Badge variant="secondary">{company.priceRange}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground line-clamp-3">{company.description}</p>
                      
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {company.services.slice(0, 3).map((service, serviceIndex) => {
                            const ServiceIcon = getServiceIcon(service);
                            const gradient = getServiceGradient(service);
                            return (
                              <Badge 
                                key={serviceIndex} 
                                className={`bg-gradient-to-r ${gradient} text-white border-0`}
                              >
                                <ServiceIcon className="w-3 h-3 mr-1" />
                                {service}
                              </Badge>
                            );
                          })}
                          {company.services.length > 3 && (
                            <Badge variant="outline">+{company.services.length - 3} more</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {company.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{company.address}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        {company.phone && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                        )}
                        {company.email && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Mail className="w-4 h-4 mr-2" />
                            Email
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No companies found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse all services
                </p>
                <Button onClick={() => setSelectedService('all')}>
                  View All Services
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Discover;
