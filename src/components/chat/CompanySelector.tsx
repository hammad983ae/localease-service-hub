import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Star, X } from 'lucide-react';

interface Company {
  _id: string;
  companyName: string;
  email: string;
  phone: string;
  services: string[];
  priceRange: string;
  rating: number;
  totalReviews: number;
  logo?: string;
}

interface CompanySelectorProps {
  showCompanySelector: boolean;
  setShowCompanySelector: (show: boolean) => void;
  companies: Company[];
  sendCompanyProfile: (company: Company) => void;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({
  showCompanySelector,
  setShowCompanySelector,
  companies,
  sendCompanyProfile
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!showCompanySelector) {
    return null;
  }

  const filteredCompanies = companies.filter(company =>
    company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Company to Share</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompanySelector(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search companies or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {filteredCompanies.map((company) => (
                <div
                  key={company._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => {
                    sendCompanyProfile(company);
                    setShowCompanySelector(false);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={company.logo} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <Building2 className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {company.companyName}
                        </h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{company.rating}</span>
                          <span className="text-gray-400">({company.totalReviews})</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Services:</span>
                          <div className="flex flex-wrap gap-1">
                            {company.services.slice(0, 3).map((service, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {company.services.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{company.services.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span><strong>Price Range:</strong> {company.priceRange}</span>
                          <span><strong>Phone:</strong> {company.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredCompanies.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No companies found</p>
                  <p className="text-sm">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
