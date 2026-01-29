-- Add token column for unique registration links
ALTER TABLE public.granted_free_accounts 
ADD COLUMN IF NOT EXISTS token text UNIQUE,
ADD COLUMN IF NOT EXISTS claimed_by uuid;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_granted_free_accounts_token ON public.granted_free_accounts(token);

-- Update RLS to allow anyone to check token validity (for registration)
CREATE POLICY "Anyone can check token validity" 
ON public.granted_free_accounts 
FOR SELECT 
USING (token IS NOT NULL AND is_used = false);