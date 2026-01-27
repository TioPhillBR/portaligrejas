-- Tabela de cupons de desconto
CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de uso de cupons
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES public.discount_coupons(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  used_at TIMESTAMPTZ DEFAULT now(),
  discount_applied NUMERIC NOT NULL,
  UNIQUE(coupon_id, church_id)
);

-- Tabela de contas gratuitas concedidas pelo admin
CREATE TABLE public.granted_free_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'prata' CHECK (plan IN ('prata', 'ouro', 'diamante')),
  granted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Histórico de assinaturas para métricas
CREATE TABLE public.subscription_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('upgrade', 'downgrade', 'new', 'cancelled', 'reactivated')),
  mrr_change NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.granted_free_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies para discount_coupons
CREATE POLICY "Platform admins can manage coupons"
ON public.discount_coupons FOR ALL
USING (is_platform_admin(auth.uid()));

CREATE POLICY "Anyone can view active coupons by code"
ON public.discount_coupons FOR SELECT
USING (is_active = true);

-- RLS Policies para coupon_uses
CREATE POLICY "Platform admins can view all coupon uses"
ON public.coupon_uses FOR ALL
USING (is_platform_admin(auth.uid()));

-- RLS Policies para granted_free_accounts
CREATE POLICY "Platform admins can manage free accounts"
ON public.granted_free_accounts FOR ALL
USING (is_platform_admin(auth.uid()));

-- RLS Policies para subscription_history
CREATE POLICY "Platform admins can view subscription history"
ON public.subscription_history FOR SELECT
USING (is_platform_admin(auth.uid()));

CREATE POLICY "System can insert subscription history"
ON public.subscription_history FOR INSERT
WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_discount_coupons_updated_at
BEFORE UPDATE ON public.discount_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.discount_coupons IS 'Cupons de desconto para assinaturas';
COMMENT ON TABLE public.granted_free_accounts IS 'Contas gratuitas concedidas pelo admin da plataforma';
COMMENT ON TABLE public.subscription_history IS 'Histórico de mudanças de plano para métricas';