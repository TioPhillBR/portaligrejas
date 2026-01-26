-- Fix infinite recursion in ministry_members by using a security definer function
CREATE OR REPLACE FUNCTION public.is_ministry_member(_user_id uuid, _ministry_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ministry_members
    WHERE user_id = _user_id
      AND ministry_id = _ministry_id
      AND is_active = true
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view ministry members of their ministries" ON public.ministry_members;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view ministry members of their ministries"
ON public.ministry_members
FOR SELECT
USING (
  public.is_ministry_member(auth.uid(), ministry_id) 
  OR auth.uid() = user_id 
  OR has_any_admin_role(auth.uid())
);

-- Create blog_likes table for article likes
CREATE TABLE public.blog_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes count"
ON public.blog_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like posts"
ON public.blog_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes"
ON public.blog_likes FOR DELETE
USING (auth.uid() = user_id);

-- Create comment_likes table
CREATE TABLE public.comment_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES public.blog_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(comment_id, user_id)
);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comment likes"
ON public.comment_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like comments"
ON public.comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
ON public.comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Update blog_comments default to require approval
ALTER TABLE public.blog_comments ALTER COLUMN is_approved SET DEFAULT false;

-- Add admins can view all comments policy (for moderation)
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;

CREATE POLICY "Anyone can view approved comments or own comments"
ON public.blog_comments FOR SELECT
USING (is_approved = true OR auth.uid() = user_id OR has_any_admin_role(auth.uid()));

-- Create home_sections table for editable sections
CREATE TABLE public.home_sections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL UNIQUE,
    title TEXT,
    subtitle TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    is_visible BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID
);

ALTER TABLE public.home_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible home sections"
ON public.home_sections FOR SELECT
USING (is_visible = true OR has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can manage home sections"
ON public.home_sections FOR ALL
USING (has_any_admin_role(auth.uid()));

-- Insert default home sections
INSERT INTO public.home_sections (section_key, title, subtitle, content, sort_order) VALUES
('hero', 'Bem-vindo à Nossa Igreja', 'Um lugar de fé, amor e comunhão', '{"background_image": "", "cta_text": "Conheça Nossa Igreja", "cta_link": "#about"}'::jsonb, 1),
('about', 'Sobre Nós', 'Nossa Missão, Visão e Valores', '{"mission": "Pregar o evangelho e fazer discípulos de todas as nações.", "vision": "Ser uma igreja que transforma vidas através do amor de Cristo.", "values": ["Fé", "Amor", "Comunhão", "Serviço"]}'::jsonb, 2),
('services', 'Horários de Culto', 'Venha adorar conosco', '{}'::jsonb, 3),
('events', 'Próximos Eventos', 'Confira nossa agenda', '{}'::jsonb, 4),
('ministries', 'Nossos Ministérios', 'Áreas de atuação da nossa igreja', '{}'::jsonb, 5),
('gallery', 'Galeria', 'Momentos especiais da nossa comunidade', '{}'::jsonb, 6),
('video', 'Vídeo Institucional', 'Conheça mais sobre nós', '{}'::jsonb, 7),
('radio', 'Web Rádio', 'Ouça nossa programação', '{}'::jsonb, 8),
('donations', 'Contribuições', 'Sua oferta faz a diferença', '{"title": "Faça sua Oferta", "description": "Contribua para a obra de Deus"}'::jsonb, 9),
('prayer', 'Pedidos de Oração', 'Compartilhe seu pedido conosco', '{"description": "Deixe seu pedido de oração que nossa equipe irá interceder por você."}'::jsonb, 10),
('contact', 'Contato', 'Fale conosco', '{"description": "Entre em contato conosco através dos canais abaixo."}'::jsonb, 11);

-- Create trigger for updated_at
CREATE TRIGGER update_home_sections_updated_at
BEFORE UPDATE ON public.home_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();