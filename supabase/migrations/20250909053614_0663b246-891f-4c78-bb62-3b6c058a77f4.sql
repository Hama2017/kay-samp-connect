-- Create table for storing phone OTP codes
CREATE TABLE IF NOT EXISTS public.phone_otp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.phone_otp ENABLE ROW LEVEL SECURITY;

-- Create policy for system to manage OTP codes
CREATE POLICY "System can manage OTP codes" 
ON public.phone_otp 
FOR ALL 
USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_phone_otp_phone_used ON public.phone_otp(phone, used);
CREATE INDEX IF NOT EXISTS idx_phone_otp_expires_at ON public.phone_otp(expires_at);