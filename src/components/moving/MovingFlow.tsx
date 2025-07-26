import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { toast } from "@/hooks/use-toast"

interface Company {
  id: string;
  name: string;
  email: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  services: string[];
  location: string;
  companyType?: string;
  description?: string;
}

interface MovingFlowProps {
  onClose: () => void;
  onBooked: () => void;
}

const GET_COMPANIES = gql`
  query GetCompanies($service: String!) {
    companies(service: $service) {
      id
      name
      email
      rating
      reviewCount
      priceRange
      services
      location
      companyType
      description
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking(
    $dateTime: String
    $dateTimeFlexible: Boolean
    $addresses: AddressInput
    $contact: ContactInput
    $rooms: [RoomInput]
    $items: [String]
    $companyId: ID!
  ) {
    createBooking(
      dateTime: $dateTime
      dateTimeFlexible: $dateTimeFlexible
      addresses: $addresses
      contact: $contact
      rooms: $rooms
      items: $items
      companyId: $companyId
    ) {
      id
    }
  }
`;

const MovingFlow: React.FC<MovingFlowProps> = ({ onClose, onBooked }) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [movingType, setMovingType] = useState<"house" | "apartment" | null>(null);
  const [roomCount, setRoomCount] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [flexible, setFlexible] = useState<boolean>(false);
  const [fromAddress, setFromAddress] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactNotes, setContactNotes] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [rooms, setRooms] = useState<{ room: string; floor: string; count: number; }[]>([{ room: 'bedroom', floor: 'ground', count: 1 }]);

  const { loading, error, data } = useQuery(GET_COMPANIES, {
    variables: { service: "moving" },
  });

  const [createBooking, { loading: bookingLoading }] = useMutation(CREATE_BOOKING, {
    onCompleted: () => {
      toast({
        title: "Booked!",
        description: "Your moving service has been booked.",
      })
      onBooked();
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      })
      console.error("Failed to create booking", error);
    },
  });

  const handleNext = () => {
    if (step === 1 && !movingType) {
      toast({
        title: "Error",
        description: "Please select moving type.",
      })
      return;
    }
    if (step === 2 && roomCount <= 0) {
      toast({
        title: "Error",
        description: "Room count must be greater than zero.",
      })
      return;
    }
    if (step === 3 && !selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company.",
      })
      return;
    }
    if (step === 4 && !date && !flexible) {
      toast({
        title: "Error",
        description: "Please select a date or be flexible.",
      })
      return;
    }
    if (step === 5 && (!fromAddress || !toAddress)) {
      toast({
        title: "Error",
        description: "Please enter addresses.",
      })
      return;
    }
    if (step === 6 && (!contactName || !contactEmail || !contactPhone)) {
      toast({
        title: "Error",
        description: "Please enter contact info.",
      })
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedCompany) {
      toast({
        title: "Error",
        description: "Please select a company before submitting.",
      })
      return;
    }

    try {
      await createBooking({
        variables: {
          dateTime: date ? date.toISOString() : null,
          dateTimeFlexible: flexible,
          addresses: { from: fromAddress, to: toAddress },
          contact: { name: contactName, email: contactEmail, phone: contactPhone, notes: contactNotes },
          rooms: rooms,
          items: items,
          companyId: selectedCompany.id,
        },
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: err.message,
      })
      console.error("Error during booking creation:", err);
    }
  };

  const handleAddItem = (item: string) => {
    setItems([...items, item]);
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setItems(items.filter(item => item !== itemToRemove));
  };

  const addRoom = () => {
    setRooms([...rooms, { room: 'bedroom', floor: 'ground', count: 1 }]);
  };

  const updateRoom = (index: number, field: keyof typeof rooms[0], value: string | number) => {
    const updatedRooms = [...rooms];
    if (field === 'count') {
      updatedRooms[index][field] = Number(value);
    } else {
      updatedRooms[index][field] = value as string;
    }
    setRooms(updatedRooms);
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
  };

  return (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>{t("Moving Service Booking")}</CardTitle>
        <CardDescription>{t("Step {step} of 7", { step })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {step === 1 && (
          <div>
            <Label>{t("Type of Moving")}</Label>
            <RadioGroup defaultValue={movingType || undefined} className="flex flex-col space-y-1" onValueChange={(value) => setMovingType(value as "house" | "apartment")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="house" id="house" />
                <Label htmlFor="house">{t("House Moving")}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="apartment" id="apartment" />
                <Label htmlFor="apartment">{t("Apartment Moving")}</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {step === 2 && (
          <div>
            <Label htmlFor="roomCount">{t("Number of Rooms")}</Label>
            <Slider
              id="roomCount"
              defaultValue={[roomCount]}
              max={10}
              step={1}
              onValueChange={(value) => setRoomCount(value[0])}
            />
            <p className="text-sm text-muted-foreground">
              {t("Selected Rooms: {roomCount}", { roomCount })}
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <Label>{t("Select Moving Company")}</Label>
            {loading ? (
              <p>{t("Loading companies...")}</p>
            ) : error ? (
              <p className="text-red-500">{t("Error: {error}", { error: error.message })}</p>
            ) : (
              <Select onValueChange={(value) => {
                const company = data.companies.find((c: Company) => c.id === value);
                setSelectedCompany(company || null);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("Select a company")} defaultValue={selectedCompany?.id} />
                </SelectTrigger>
                <SelectContent>
                  {data.companies.map((company: Company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedCompany && (
              <div className="mt-4">
                <p className="font-medium">{selectedCompany.name}</p>
                <p className="text-sm text-muted-foreground">{selectedCompany.description}</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div>
            <Label>{t("Select Date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "PPP") : <span>{t("Pick a date")}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox id="flexible" checked={flexible} onCheckedChange={(checked) => setFlexible(!!checked)} />
              <Label htmlFor="flexible">{t("I'm flexible with the date")}</Label>
            </div>
          </div>
        )}

        {step === 5 && (
          <>
            <div>
              <Label htmlFor="fromAddress">{t("From Address")}</Label>
              <Input id="fromAddress" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="toAddress">{t("To Address")}</Label>
              <Input id="toAddress" value={toAddress} onChange={(e) => setToAddress(e.target.value)} />
            </div>
          </>
        )}

        {step === 6 && (
          <>
            <div>
              <Label htmlFor="contactName">{t("Contact Name")}</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactEmail">{t("Contact Email")}</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactPhone">{t("Contact Phone")}</Label>
              <Input id="contactPhone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="contactNotes">{t("Additional Notes")}</Label>
              <Textarea id="contactNotes" placeholder={t("Any special instructions?")} value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} />
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div>
              <Label>{t("Moving Items")}</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleAddItem('Sofa')}>
                  {t("Add Sofa")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddItem('Bed')}>
                  {t("Add Bed")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleAddItem('Table')}>
                  {t("Add Table")}
                </Button>
              </div>
              <div className="mt-2">
                {items.length > 0 && (
                  <p>{t("Selected items:")}</p>
                )}
                {items.map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <p>{item}</p>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item)}>
                      {t("Remove")}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>{t("Rooms Information")}</Label>
              {rooms.map((room, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-center mb-2">
                  <div>
                    <Label htmlFor={`room-${index}`}>{t("Room Type")}</Label>
                    <Select onValueChange={(value) => updateRoom(index, 'room', value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t("Select")} defaultValue={room.room} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bedroom">{t("Bedroom")}</SelectItem>
                        <SelectItem value="livingroom">{t("Living Room")}</SelectItem>
                        <SelectItem value="kitchen">{t("Kitchen")}</SelectItem>
                        <SelectItem value="bathroom">{t("Bathroom")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`floor-${index}`}>{t("Floor")}</Label>
                    <Select onValueChange={(value) => updateRoom(index, 'floor', value)}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder={t("Select")} defaultValue={room.floor} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ground">{t("Ground Floor")}</SelectItem>
                        <SelectItem value="1st">{t("1st Floor")}</SelectItem>
                        <SelectItem value="2nd">{t("2nd Floor")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`count-${index}`}>{t("Count")}</Label>
                    <Input
                      type="number"
                      id={`count-${index}`}
                      value={room.count.toString()}
                      onChange={(e) => updateRoom(index, 'count', parseInt(e.target.value))}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRoom(index)}>
                    {t("Remove")}
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addRoom}>
                {t("Add Room")}
              </Button>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 && (
          <Button variant="secondary" onClick={handleBack}>
            {t("Back")}
          </Button>
        )}
        {step < 7 ? (
          <Button onClick={handleNext}>{t("Next")}</Button>
        ) : (
          <Button disabled={bookingLoading} onClick={handleSubmit}>
            {bookingLoading ? t("Booking...") : t("Submit")}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MovingFlow;
