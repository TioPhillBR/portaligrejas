-- Adicionar campos de controle de pagamentos na tabela churches
ALTER TABLE public.churches 
ADD COLUMN IF NOT EXISTS payment_overdue_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT DEFAULT NULL;

COMMENT ON COLUMN public.churches.payment_overdue_at IS 'Data do primeiro pagamento em atraso';
COMMENT ON COLUMN public.churches.asaas_subscription_id IS 'ID da assinatura no Asaas';
COMMENT ON COLUMN public.churches.asaas_customer_id IS 'ID do cliente no Asaas';