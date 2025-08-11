import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Globe, Truck, Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/api/client';

interface Company {
  id: string;
  name: string;
  description: string;
  services: string[];
  priceRange: string;
  email: string;
  phone: string;
  address: string;
  companyType: string;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  features: string[];
  estimatedTime: string;
  insurance: boolean;
  packingService: boolean;
}

interface MovingSuppliersProps {
  onSupplierSelect?: (supplier: Supplier) => void;
  selectedSupplier?: Supplier | null;
}

const MovingSuppliers: React.FC<MovingSuppliersProps> = ({ onSupplierSelect, selectedSupplier: externalSelectedSupplier }) => {
  const { t } = useLanguage();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(externalSelectedSupplier?.id || null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies from the backend
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllCompanies();
        
        // Filter for moving companies and transform data
        const movingCompanies = (response.companies || [])
          .filter((company: Company) => company.companyType === 'Moving')
          .map((company: Company) => ({
            id: company.id,
            name: company.name,
            rating: 4.5, // Default rating since it's not in the Company model
            reviews: 50, // Default reviews count
            price: company.priceRange || 'Contact for quote',
            location: company.address || 'Location not specified',
            phone: company.phone || 'Phone not available',
            email: company.email,
            website: company.email ? `${company.email.split('@')[1]}` : 'Website not available',
            services: company.services || [],
            features: company.description ? [company.description] : ['Professional moving services'],
            estimatedTime: '1-3 days', // Default estimate
            insurance: true, // Default to true for moving companies
            packingService: company.services?.includes('Packing Services') || false
          }));
        
        setSuppliers(movingCompanies);
      } catch (err: any) {
        console.error('Error fetching suppliers:', err);
        setError(err.message || 'Failed to fetch suppliers');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier && onSupplierSelect) {
      onSupplierSelect(supplier);
    }
  };

  const handleContactSupplier = (supplier: Supplier) => {
    // In a real app, this would open a contact form or initiate a call
    console.log('Contacting supplier:', supplier.name);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading moving suppliers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Truck className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading suppliers</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No moving suppliers available</h3>
          <p className="text-gray-500">We couldn't find any moving companies in your area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Moving Suppliers</h2>
        <p className="text-gray-600">Choose from our trusted network of moving companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <Card
            key={supplier.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSupplier === supplier.id ? "ring-2 ring-primary shadow-lg" : ""
            }`}
            onClick={() => handleSelectSupplier(supplier.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{supplier.name}</CardTitle>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(supplier.rating)}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({supplier.reviews} reviews)
                    </span>
                  </div>
                </div>
                {selectedSupplier === supplier.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Services */}
              <div className="flex flex-wrap gap-2">
                {supplier.services.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {supplier.services.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{supplier.services.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                {supplier.features.slice(0, 2).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.location}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.email}</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{supplier.estimatedTime}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {supplier.insurance ? 'Insured' : 'Not insured'}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {supplier.price}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  className={`flex-1 ${
                    selectedSupplier === supplier.id
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSupplier(supplier.id);
                  }}
                >
                  {selectedSupplier === supplier.id ? 'Selected' : 'Select'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactSupplier(supplier);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSupplier && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-primary">
              {suppliers.find(s => s.id === selectedSupplier)?.name}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MovingSuppliers; 