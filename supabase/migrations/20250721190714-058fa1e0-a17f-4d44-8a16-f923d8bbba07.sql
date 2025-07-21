
-- Create a table for storing moving bookings
CREATE TABLE public.moving_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'moving',
  date_time TIMESTAMP WITH TIME ZONE,
  from_address TEXT,
  to_address TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create a table for storing room selections for each booking
CREATE TABLE public.booking_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.moving_bookings(id) ON DELETE CASCADE NOT NULL,
  floor TEXT NOT NULL,
  room TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create a table for storing item selections for each booking
CREATE TABLE public.booking_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.moving_bookings(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on all booking tables
ALTER TABLE public.moving_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- Create policies for moving_bookings table
CREATE POLICY "Users can view their own bookings" 
  ON public.moving_bookings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
  ON public.moving_bookings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
  ON public.moving_bookings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for booking_rooms table
CREATE POLICY "Users can view their booking rooms" 
  ON public.booking_rooms 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.moving_bookings 
      WHERE id = booking_rooms.booking_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their booking rooms" 
  ON public.booking_rooms 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.moving_bookings 
      WHERE id = booking_rooms.booking_id 
      AND user_id = auth.uid()
    )
  );

-- Create policies for booking_items table
CREATE POLICY "Users can view their booking items" 
  ON public.booking_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.moving_bookings 
      WHERE id = booking_items.booking_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their booking items" 
  ON public.booking_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.moving_bookings 
      WHERE id = booking_items.booking_id 
      AND user_id = auth.uid()
    )
  );
