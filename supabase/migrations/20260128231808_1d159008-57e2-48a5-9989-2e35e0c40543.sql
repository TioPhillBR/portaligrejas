-- Remover constraint UNIQUE global incorreta
ALTER TABLE public.site_settings 
DROP CONSTRAINT IF EXISTS site_settings_key_key;

-- Criar constraint UNIQUE composta correta (por igreja)
ALTER TABLE public.site_settings 
ADD CONSTRAINT site_settings_church_key_unique 
UNIQUE (church_id, key);