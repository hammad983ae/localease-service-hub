
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
// TODO: Integrate with Node.js/MongoDB backend for company selection data
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
}

interface CompanySelectionProps {
  onCompanySelect: (company: Company) => void;
  selectedCompany: Company | null;
}

const CompanySelection: React.FC<CompanySelectionProps> = ({ onCompanySelect, selectedCompany }) => {
  const { t } = useLanguage();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['moving_companies'],
    queryFn: async () => {
      // TODO: Fetch company data from backend
      return [];
    },
  });

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
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Moving Company
          </h2>
          <p className="text-muted-foreground">Loading available companies...</p>
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Choose Your Moving Company
        </h2>
        <p className="text-muted-foreground">Select a trusted moving company for your relocation</p>
      </div>

      <div className="grid gap-6">
        {companies?.map((company) => {
          const isSelected = selectedCompany?.id === company.id;
          
          return (
            <Card
              key={company.id}
              className={cn(
                "cursor-pointer transition-all duration-300 hover:shadow-lg",
                isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
              )}
              onClick={() => onCompanySelect(company)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-xl">{company.name}</CardTitle>
                      {isSelected && <CheckCircle className="h-6 w-6 text-green-500" />}
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(company.rating)}
                        <span className="text-sm font-medium ml-1">{company.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({company.total_reviews} reviews)
                        </span>
                      </div>
                      <Badge className={getPriceRangeColor(company.price_range)}>
                        {company.price_range}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{company.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{company.contact_phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{company.contact_email}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Services:</h4>
                    <div className="flex flex-wrap gap-1">
                      {company.services.map((service) => (
                        <Badge key={service} variant="outline" className="text-xs">
                          {service.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CompanySelection;
