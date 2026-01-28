-- Remover foreign key constraint que referencia auth.users
-- Esta constraint causa problemas porque auth.users é gerenciado pelo Supabase
ALTER TABLE public.churches 
DROP CONSTRAINT IF EXISTS churches_owner_id_fkey;