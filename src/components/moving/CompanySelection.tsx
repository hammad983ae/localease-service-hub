
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import { gql, useQuery } from '@apollo/client';
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
    }
  }
`;

const CompanySelection: React.FC<CompanySelectionProps> = ({ onCompanySelect, selectedCompany }) => {
  const { t } = useLanguage();

  const { data, loading } = useQuery(ALL_COMPANIES_QUERY);
  const companies = data?.allCompanies || [];

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

  if (loading) {
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
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold mb-1">{company.name}</CardTitle>
                    <div className="text-sm text-muted-foreground mb-2">{company.description}</div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {company.services?.map((service: string) => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={cn("px-2 py-1 rounded", getPriceRangeColor(company.priceRange))}>{company.priceRange || 'N/A'}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle className="h-6 w-6 text-blue-500" />}
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
