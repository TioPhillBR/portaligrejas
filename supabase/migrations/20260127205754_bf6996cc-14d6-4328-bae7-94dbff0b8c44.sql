-- Atualizar constraint de plano para os novos planos: prata, ouro, diamante
ALTER TABLE public.churches DROP CONSTRAINT IF EXISTS churches_plan_check;

ALTER TABLE public.churches ADD CONSTRAINT churches_plan_check 
CHECK (plan = ANY (ARRAY['prata'::text, 'ouro'::text, 'diamante'::text]));

-- Atualizar planos existentes que estavam como 'free' para 'prata'
UPDATE public.churches SET plan = 'prata' WHERE plan = 'free';
UPDATE public.churches SET plan = 'ouro' WHERE plan = 'pro';
UPDATE public.churches SET plan = 'diamante' WHERE plan = 'plus';