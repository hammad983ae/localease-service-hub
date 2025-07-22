
-- Create a table to store user service selections
CREATE TABLE public.user_service_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL, -- 'moving', 'disposal', 'transport'
  selection_type TEXT NOT NULL, -- 'quote' or 'supplier'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_type) -- One selection per service type per user
);

-- Create a table for moving companies/suppliers
CREATE TABLE public.moving_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  location TEXT,
  services TEXT[], -- Array of services they offer
  price_range TEXT, -- 'budget', 'mid-range', 'premium'
  image_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS on user_service_selections
ALTER TABLE public.user_service_selections ENABLE ROW LEVEL SECURITY;

-- Create policies for user_service_selections
CREATE POLICY "Users can view their own service selections" 
  ON public.user_service_selections 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service selections" 
  ON public.user_service_selections 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service selections" 
  ON public.user_service_selections 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Enable RLS on moving_companies (public read access)
ALTER TABLE public.moving_companies ENABLE ROW LEVEL SECURITY;

-- Create policy for moving_companies (everyone can read active companies)
CREATE POLICY "Anyone can view active moving companies" 
  ON public.moving_companies 
  FOR SELECT 
  USING (is_active = true);

-- Insert some sample moving companies
INSERT INTO public.moving_companies (name, description, rating, total_reviews, location, services, price_range, contact_phone, contact_email) VALUES
('Swift Movers', 'Professional moving services with 10+ years of experience', 4.8, 156, 'Downtown', ARRAY['local_moving', 'long_distance', 'packing'], 'mid-range', '+1-555-0123', 'info@swiftmovers.com'),
('Elite Moving Co', 'Premium moving services for luxury relocations', 4.9, 89, 'Uptown', ARRAY['local_moving', 'long_distance', 'packing', 'storage'], 'premium', '+1-555-0456', 'contact@elitemoving.com'),
('Budget Relocators', 'Affordable moving solutions for students and families', 4.2, 234, 'Suburbs', ARRAY['local_moving', 'packing'], 'budget', '+1-555-0789', 'hello@budgetrelocators.com'),
('Green Movers', 'Eco-friendly moving services with sustainable practices', 4.6, 112, 'City Center', ARRAY['local_moving', 'long_distance', 'packing'], 'mid-range', '+1-555-0321', 'info@greenmovers.com');
