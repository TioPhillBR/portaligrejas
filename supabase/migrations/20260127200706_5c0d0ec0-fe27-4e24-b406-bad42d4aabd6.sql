-- Adicionar 'usuario' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'usuario';

-- Criar função para atribuir role de usuario automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'usuario');
    RETURN NEW;
END;
$$;

-- Criar trigger para atribuir role automaticamente
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();