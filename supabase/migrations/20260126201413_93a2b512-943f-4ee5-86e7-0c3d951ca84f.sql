-- Fase 2: Schema do Banco de Dados para Sistema de Membros, Chat e Comunicação

-- PRIMEIRO: Criar função para calcular faixa etária (precisa existir antes de ser usada)
CREATE OR REPLACE FUNCTION public.get_age_range(birth_date date)
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public
AS $$
    SELECT CASE
        WHEN birth_date IS NULL THEN 'desconhecido'
        WHEN EXTRACT(YEAR FROM age(birth_date)) < 13 THEN 'crianca'
        WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 13 AND 30 THEN 'jovem'
        WHEN EXTRACT(YEAR FROM age(birth_date)) BETWEEN 31 AND 50 THEN 'adulto'
        ELSE 'terceira_idade'
    END
$$;

-- 2.1 Adicionar novas colunas na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS is_public_member boolean DEFAULT true;

-- Atualizar políticas RLS de profiles para permitir que admins vejam todos
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_any_admin_role(auth.uid()));

-- 2.2 Criar tabela ministry_members
CREATE TABLE public.ministry_members (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ministry_id uuid NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    joined_at timestamp with time zone NOT NULL DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(user_id, ministry_id)
);

ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ministry_members
CREATE POLICY "Users can view their own ministry memberships"
ON public.ministry_members FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view ministry members of their ministries"
ON public.ministry_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ministry_members mm
        WHERE mm.ministry_id = ministry_members.ministry_id
        AND mm.user_id = auth.uid()
        AND mm.is_active = true
    )
);

CREATE POLICY "Users can join ministries"
ON public.ministry_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave ministries"
ON public.ministry_members FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all ministry members"
ON public.ministry_members FOR ALL
USING (has_any_admin_role(auth.uid()));

-- 3.1 Criar tabela chat_messages
CREATE TABLE public.chat_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ministry_id uuid NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text,
    message_type text NOT NULL DEFAULT 'text',
    media_url text,
    is_announcement boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para chat_messages
CREATE POLICY "Ministry members can view chat messages"
ON public.chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.ministry_members mm
        WHERE mm.ministry_id = chat_messages.ministry_id
        AND mm.user_id = auth.uid()
        AND mm.is_active = true
    )
    OR has_any_admin_role(auth.uid())
);

CREATE POLICY "Ministry members can send chat messages"
ON public.chat_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.ministry_members mm
        WHERE mm.ministry_id = chat_messages.ministry_id
        AND mm.user_id = auth.uid()
        AND mm.is_active = true
    )
);

CREATE POLICY "Users can delete their own messages"
ON public.chat_messages FOR DELETE
USING (auth.uid() = sender_id OR has_any_admin_role(auth.uid()));

-- 3.2 Criar tabela direct_messages
CREATE TABLE public.direct_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text,
    message_type text NOT NULL DEFAULT 'text',
    media_url text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para direct_messages
CREATE POLICY "Users can view their own direct messages"
ON public.direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send direct messages"
ON public.direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of received messages"
ON public.direct_messages FOR UPDATE
USING (auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own sent messages"
ON public.direct_messages FOR DELETE
USING (auth.uid() = sender_id);

-- 3.3 Criar tabela broadcast_messages
CREATE TABLE public.broadcast_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type text NOT NULL,
    target_value text,
    title text,
    content text NOT NULL,
    message_type text NOT NULL DEFAULT 'text',
    media_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para broadcast_messages
CREATE POLICY "Members can view broadcast messages targeting them"
ON public.broadcast_messages FOR SELECT
USING (
    target_type = 'all'
    OR (target_type = 'ministry' AND EXISTS (
        SELECT 1 FROM public.ministry_members mm
        WHERE mm.ministry_id::text = broadcast_messages.target_value
        AND mm.user_id = auth.uid()
        AND mm.is_active = true
    ))
    OR (target_type = 'gender' AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.gender = broadcast_messages.target_value
    ))
    OR (target_type = 'age_range' AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = auth.uid()
        AND p.birth_date IS NOT NULL
        AND public.get_age_range(p.birth_date) = broadcast_messages.target_value
    ))
    OR has_any_admin_role(auth.uid())
);

CREATE POLICY "Admins can create broadcast messages"
ON public.broadcast_messages FOR INSERT
WITH CHECK (has_any_admin_role(auth.uid()) OR has_role(auth.uid(), 'lider_ministerio'));

CREATE POLICY "Admins can delete broadcast messages"
ON public.broadcast_messages FOR DELETE
USING (has_any_admin_role(auth.uid()));

-- Habilitar Realtime nas tabelas de mensagens
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_messages;

-- Atualizar o trigger handle_new_user para incluir novos campos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, phone, gender, birth_date)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'gender',
        CASE 
            WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
            AND NEW.raw_user_meta_data->>'birth_date' != ''
            THEN (NEW.raw_user_meta_data->>'birth_date')::date
            ELSE NULL
        END
    );
    RETURN NEW;
END;
$$;

-- Criar bucket para mídia do chat
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para chat-media
CREATE POLICY "Authenticated users can upload chat media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view chat media"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

CREATE POLICY "Users can delete their own chat media"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-media' AND auth.uid()::text = (storage.foldername(name))[1]);