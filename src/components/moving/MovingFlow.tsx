import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CaretSortIcon, CheckCircle, XCircle } from '@radix-ui/react-icons';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  companyType?: string;
}

interface MovingFlowProps {
  type: 'quote' | 'supplier';
  onBack: () => void;
}

const GET_COMPANIES = gql`
  query Companies($companyType: String) {
    companies(companyType: $companyType) {
      id
      name
      email
      phone
      address
      rating
      companyType
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking(
    $companyId: ID!
    $dateTime: String
    $dateTimeFlexible: Boolean
    $addresses: AddressInput!
    $contact: ContactInput!
    $rooms: [RoomInput!]
    $items: [String!]
    $bookingType: String!
  ) {
    createBooking(
      companyId: $companyId
      dateTime: $dateTime
      dateTimeFlexible: $dateTimeFlexible
      addresses: $addresses
      contact: $contact
      rooms: $rooms
      items: $items
      bookingType: $bookingType
    ) {
      id
    }
  }
`;

const MovingFlow: React.FC<MovingFlowProps> = ({ type, onBack }) => {
  const [step, setStep] = useState(1);
  const [companyId, setCompanyId] = useState('');
  const [dateTime, setDateTime] = useState<Date | undefined>(undefined);
  const [dateTimeFlexible, setDateTimeFlexible] = useState(false);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [rooms, setRooms] = useState([{ room: 'bedroom', floor: '1', count: '1' }]);
  const [items, setItems] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { loading, error, data } = useQuery(GET_COMPANIES, {
    variables: { companyType: 'moving' },
  });

  const [createBooking] = useMutation(CREATE_BOOKING);

  const companies = data?.companies?.map(company => ({
    ...company,
    companyType: company.companyType || 'moving' // Add default companyType
  })) || [];

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!companyId || !fromAddress || !toAddress || !contactName || !contactEmail || !contactPhone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBooking({
        variables: {
          companyId: companyId,
          dateTime: dateTime ? dateTime.toISOString() : null,
          dateTimeFlexible: dateTimeFlexible,
          addresses: { from: fromAddress, to: toAddress },
          contact: { name: contactName, email: contactEmail, phone: contactPhone, notes: notes },
          rooms: rooms,
          items: items,
          bookingType: 'moving'
        }
      });

      toast({
        title: "Success",
        description: "Booking created successfully!",
      });

      navigate('/bookings');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {type === 'quote' ? 'Get Moving Quote' : 'Book Moving Service'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Select Company</h2>
                {loading ? (
                  <div>Loading companies...</div>
                ) : error ? (
                  <div>Error: {error.message}</div>
                ) : (
                  <Select onValueChange={setCompanyId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a moving company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button onClick={handleNext} disabled={!companyId}>Next</Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Date and Time</h2>
                <div className="grid grid-cols-1 gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTime ? format(dateTime, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start" side="bottom">
                      <Calendar
                        mode="single"
                        selected={dateTime}
                        onSelect={setDateTime}
                        disabled={(date) =>
                          date > new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id="flexible"
                      checked={dateTimeFlexible}
                      onChange={(e) => setDateTimeFlexible(e.target.checked)}
                    />
                    <Label htmlFor="flexible">Date is flexible</Label>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Addresses</h2>
                <Input
                  type="text"
                  placeholder="From Address"
                  value={fromAddress}
                  onChange={(e) => setFromAddress(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="To Address"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <Input
                  type="text"
                  placeholder="Contact Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <Input
                  type="email"
                  placeholder="Contact Email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <Input
                  type="tel"
                  placeholder="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Back</Button>
                  <Button onClick={handleNext}>Next</Button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Review and Submit</h2>
                <p>Company ID: {companyId}</p>
                <p>Date: {dateTime ? dateTime.toLocaleDateString() : 'Flexible'}</p>
                <p>From Address: {fromAddress}</p>
                <p>To Address: {toAddress}</p>
                <p>Contact Name: {contactName}</p>
                <p>Contact Email: {contactEmail}</p>
                <p>Contact Phone: {contactPhone}</p>
                <Button onClick={handleBack} variant="outline">Back</Button>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MovingFlow;
