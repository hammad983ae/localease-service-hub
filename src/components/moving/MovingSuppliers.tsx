import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Globe, Truck, Shield, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { gql, useQuery } from '@apollo/client';

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

const ALL_COMPANIES_QUERY = gql`
  query AllCompanies {
    allCompanies {
      id
      name
      description
      services
      priceRange
      email
      phone
      address
      companyType
    }
  }
`;

interface MovingSuppliersProps {
  onSupplierSelect?: (supplier: Supplier) => void;
  selectedSupplier?: Supplier | null;
}

const MovingSuppliers: React.FC<MovingSuppliersProps> = ({ onSupplierSelect, selectedSupplier: externalSelectedSupplier }) => {
  const { t } = useLanguage();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(externalSelectedSupplier?.id || null);

  // Fetch companies from the backend
  const { data, loading, error } = useQuery(ALL_COMPANIES_QUERY);

  // Filter for moving companies and transform data
  const suppliers: Supplier[] = React.useMemo(() => {
    if (!data?.allCompanies) return [];

    return data.allCompanies
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
  }, [data]);

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
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {t('moving.chooseSupplier') || 'Choose Your Moving Supplier'}
          </h2>
          <p className="text-gray-600">
            {t('moving.supplierDescription') || 'Compare quotes and select the best moving service for your needs'}
          </p>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading moving companies...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {t('moving.chooseSupplier') || 'Choose Your Moving Supplier'}
          </h2>
          <p className="text-gray-600">
            {t('moving.supplierDescription') || 'Compare quotes and select the best moving service for your needs'}
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading moving companies. Please try again later.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {t('moving.chooseSupplier') || 'Choose Your Moving Supplier'}
          </h2>
          <p className="text-gray-600">
            {t('moving.supplierDescription') || 'Compare quotes and select the best moving service for your needs'}
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No moving companies are currently available.</p>
          <p className="text-sm text-gray-500">Please check back later or contact support for assistance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {t('moving.chooseSupplier') || 'Choose Your Moving Supplier'}
        </h2>
        <p className="text-gray-600">
          {t('moving.supplierDescription') || 'Compare quotes and select the best moving service for your needs'}
        </p>
      </div>

      <div className="grid gap-4">
        {suppliers.map((supplier) => (
          <Card
            key={supplier.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedSupplier === supplier.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelectSupplier(supplier.id)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{supplier.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(supplier.rating)}
                    </div>
                    <span className="text-sm text-gray-600">
                      {supplier.rating} ({supplier.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {supplier.location}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{supplier.price}</div>
                  <div className="text-sm text-gray-500">{supplier.estimatedTime}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Services</h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {supplier.services.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold mb-2">Features</h4>
                  <div className="space-y-1">
                    {supplier.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <span>{supplier.website}</span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-gray-500" />
                      <span>{supplier.insurance ? 'Insurance Included' : 'Insurance Available'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-gray-500" />
                      <span>{supplier.packingService ? 'Packing Service Available' : 'Self Packing Required'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContactSupplier(supplier);
                  }}
                >
                  Contact Supplier
                </Button>
                <Button
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSupplier(supplier.id);
                  }}
                >
                  {selectedSupplier === supplier.id ? 'Selected' : 'Select This Supplier'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSupplier && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">
            {t('moving.supplierSelected') || 'Supplier Selected!'}
          </h3>
          <p className="text-green-700">
            {t('moving.nextSteps') || 'You can now proceed to the next step to continue with your booking.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MovingSuppliers; 