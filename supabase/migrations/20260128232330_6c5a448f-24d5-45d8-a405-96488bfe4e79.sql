-- Remover foreign key constraint que referencia auth.users na tabela church_members
-- Esta constraint causa problemas com sessões antigas e usuários deletados
ALTER TABLE public.church_members 
DROP CONSTRAINT IF EXISTS church_members_user_id_fkey;