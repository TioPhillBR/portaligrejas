-- Criar tabela para configurações de temas
CREATE TABLE public.theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_theme TEXT NOT NULL DEFAULT 'royal-blue-gold',
  light_colors JSONB NOT NULL DEFAULT '{
    "background": "0 0% 100%",
    "foreground": "220 30% 10%",
    "primary": "224 76% 37%",
    "primary-foreground": "0 0% 100%",
    "gold": "43 74% 52%",
    "gold-foreground": "0 0% 10%",
    "secondary": "220 20% 96%",
    "secondary-foreground": "220 30% 10%",
    "muted": "220 14% 96%",
    "muted-foreground": "220 10% 45%",
    "accent": "220 14% 96%",
    "accent-foreground": "220 30% 10%",
    "border": "220 14% 90%",
    "card": "0 0% 100%",
    "card-foreground": "220 30% 10%"
  }'::jsonb,
  dark_colors JSONB NOT NULL DEFAULT '{
    "background": "220 30% 6%",
    "foreground": "0 0% 98%",
    "primary": "224 76% 55%",
    "primary-foreground": "0 0% 100%",
    "gold": "43 80% 55%",
    "gold-foreground": "0 0% 10%",
    "secondary": "220 25% 15%",
    "secondary-foreground": "0 0% 98%",
    "muted": "220 25% 15%",
    "muted-foreground": "220 10% 60%",
    "accent": "220 25% 18%",
    "accent-foreground": "0 0% 98%",
    "border": "220 25% 18%",
    "card": "220 30% 10%",
    "card-foreground": "0 0% 98%"
  }'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Inserir registro inicial
INSERT INTO public.theme_settings (id) VALUES (gen_random_uuid());

-- Habilitar RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view theme settings" 
ON public.theme_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can update theme settings" 
ON public.theme_settings 
FOR UPDATE 
USING (has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can insert theme settings" 
ON public.theme_settings 
FOR INSERT 
WITH CHECK (has_any_admin_role(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_theme_settings_updated_at
BEFORE UPDATE ON public.theme_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();