

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { gql, useMutation } from '@apollo/client';

const CREATE_COMPANY_PROFILE = gql`
  mutation CreateCompanyProfile(
    $name: String!,
    $email: String!,
    $phone: String,
    $address: String,
    $description: String,
    $services: [String!],
    $priceRange: String,
    $companyType: String
  ) {
    createCompanyProfile(
      name: $name,
      email: $email,
      phone: $phone,
      address: $address,
      description: $description,
      services: $services,
      priceRange: $priceRange,
      companyType: $companyType
    ) {
      id
      name
      companyType
      email
      phone
      address
      description
      services
      priceRange
      createdAt
    }
  }
`;

const availableServices = [
  'Local Moving',
  'Long Distance Moving',
  'Office Moving',
  'Packing Services',
  'Storage Solutions',
  'Furniture Assembly',
  'Cleaning Services',
  'Waste Disposal'
];

const priceRanges = [
  '$50 - $100',
  '$100 - $200',
  '$200 - $500',
  '$500 - $1000',
  '$1000+'
];

const companyTypes = [
  'Moving',
  'Disposal',
  'Transport',
  'Cleaning',
  'Storage',
  'Other'
];

const CompanyOnboarding: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    services: [] as string[],
    priceRange: '',
    companyType: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createCompanyProfile, { loading }] = useMutation(CREATE_COMPANY_PROFILE);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service: string) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data } = await createCompanyProfile({ variables: form });
      setSuccess('Company profile created! Redirecting to dashboard...');
      setTimeout(() => navigate('/company-dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create company profile');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
              {/* Icon can go here */}
            </div>
            <CardTitle className="text-2xl">Complete Your Company Profile</CardTitle>
            <p className="text-muted-foreground">
              Tell us about your company to start receiving service requests
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea id="description" name="description" value={form.description} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyType">Company Type</Label>
                <select
                  id="companyType"
                  name="companyType"
                  value={form.companyType}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select type...</option>
                  {companyTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label>Services Offered</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableServices.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={form.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Price Range</Label>
                <div className="grid grid-cols-3 gap-2">
                  {priceRanges.map((range) => (
                    <Button
                      key={range}
                      type="button"
                      variant={form.priceRange === range ? 'default' : 'outline'}
                      onClick={() => setForm(prev => ({ ...prev, priceRange: range }))}
                      className="text-sm"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || form.services.length === 0}
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
              {error && <div className="text-red-600 text-sm mt-2">Error: {error}</div>}
              {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyOnboarding;
