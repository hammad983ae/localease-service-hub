
-- Add phone and address columns to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN phone text,
ADD COLUMN address text;
