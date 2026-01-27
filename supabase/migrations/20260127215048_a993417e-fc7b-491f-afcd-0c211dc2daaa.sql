-- Create table for payment history / invoices
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  asaas_payment_id TEXT,
  asaas_subscription_id TEXT,
  amount NUMERIC NOT NULL,
  original_amount NUMERIC,
  discount_amount NUMERIC DEFAULT 0,
  coupon_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  billing_type TEXT,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT,
  description TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Church owners can view their payment history"
ON public.payment_history FOR SELECT
USING (is_church_owner_fn(auth.uid(), church_id) OR is_platform_admin(auth.uid()));

CREATE POLICY "System can insert payment history"
ON public.payment_history FOR INSERT
WITH CHECK (true);

CREATE POLICY "Platform admins can manage payment history"
ON public.payment_history FOR ALL
USING (is_platform_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_payment_history_church_id ON public.payment_history(church_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);

-- Add columns to churches for pro-rata tracking
ALTER TABLE public.churches
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS pro_rata_credit NUMERIC DEFAULT 0;

-- Create trigger for updated_at
CREATE TRIGGER update_payment_history_updated_at
BEFORE UPDATE ON public.payment_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();