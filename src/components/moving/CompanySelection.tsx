
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Phone, Mail, CheckCircle, Building2 } from 'lucide-react';
import { apiClient } from '@/api/client';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  description: string;
  rating: number;
  total_reviews: number;
  location: string;
  services: string[];
  price_range: string;
  image_url?: string;
  contact_phone: string;
  contact_email: string;
  companyType: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface CompanySelectionProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany: Company | null;
  service?: string;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({ onCompanySelect, selectedCompany, service }) => {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllCompanies();
        let allCompanies = response.companies || [];
        
        // Filter by service type if specified
        if (service) {
          allCompanies = allCompanies.filter((company: any) => company.companyType === service);
        }
        
        setCompanies(allCompanies);
      } catch (err: any) {
        console.error('Error fetching companies:', err);
        setError(err.message || 'Failed to fetch companies');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [service]);

  const getServiceTitle = () => {
    switch (service) {
      case 'Moving':
        return 'Choose Your Moving Company';
      case 'Disposal':
        return 'Choose Your Disposal Company';
      case 'Transport':
        return 'Choose Your Transport Company';
      default:
        return 'Choose Your Company';
    }
  };

  const getServiceSubtitle = () => {
    switch (service) {
      case 'Moving':
        return 'Select a trusted moving company for your relocation';
      case 'Disposal':
        return 'Select a trusted disposal company for your waste removal';
      case 'Transport':
        return 'Select a trusted transport company for your delivery';
      default:
        return 'Select a trusted company for your service';
    }
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'mid-range':
        return 'bg-blue-100 text-blue-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        )}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading companies</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No companies available</h3>
          <p className="text-gray-500">
            {service ? `No ${service.toLowerCase()} companies found` : 'No companies found for this service'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{getServiceTitle()}</h2>
        <p className="text-gray-600">{getServiceSubtitle()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <Card
            key={company.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg",
              selectedCompany?.id === company.id && "ring-2 ring-primary shadow-lg"
            )}
            onClick={() => onCompanySelect(company)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{company.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                </div>
                {selectedCompany?.id === company.id && (
                  <CheckCircle className="h-6 w-6 text-primary" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {renderStars(company.rating || 0)}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({company.total_reviews || 0} reviews)
                </span>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2">
                {company.services?.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {company.services && company.services.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{company.services.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{company.location || company.address || 'Location not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{company.contact_phone || company.phone || 'Phone not specified'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{company.contact_email || company.email || 'Email not specified'}</span>
                </div>
              </div>

              {/* Price Range */}
              {company.price_range && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Price Range:</span>
                  <Badge className={getPriceRangeColor(company.price_range)}>
                    {company.price_range}
                  </Badge>
                </div>
              )}

              {/* Select Button */}
              <Button
                className={cn(
                  "w-full",
                  selectedCompany?.id === company.id
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-secondary hover:bg-secondary/80"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompanySelect(company);
                }}
              >
                {selectedCompany?.id === company.id ? 'Selected' : 'Select Company'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCompany && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-primary">{selectedCompany.name}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanySelection;
