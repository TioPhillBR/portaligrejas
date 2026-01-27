-- =====================================================
-- FASE 1B: ESTRUTURA MULTI-TENANT COMPLETA
-- Portal Igrejas - "Seu site no ar em poucos minutos"
-- =====================================================

-- 1. CRIAR TABELA DE IGREJAS (TENANTS)
-- =====================================================
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  
  -- Plano e status
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'plus')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  trial_ends_at TIMESTAMPTZ,
  
  -- Configurações específicas da igreja
  settings JSONB DEFAULT '{}',
  theme_settings JSONB DEFAULT '{}',
  
  -- Owner da igreja
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para performance
CREATE INDEX idx_churches_slug ON public.churches(slug);
CREATE INDEX idx_churches_owner ON public.churches(owner_id);
CREATE INDEX idx_churches_status ON public.churches(status);

-- Trigger para updated_at
CREATE TRIGGER update_churches_updated_at
  BEFORE UPDATE ON public.churches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. CRIAR TABELA DE MEMBROS POR IGREJA
-- =====================================================
CREATE TABLE public.church_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'moderator', 'member')),
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(church_id, user_id)
);

-- Índices
CREATE INDEX idx_church_members_church ON public.church_members(church_id);
CREATE INDEX idx_church_members_user ON public.church_members(user_id);
CREATE INDEX idx_church_members_role ON public.church_members(role);

-- 3. ADICIONAR church_id EM TODAS AS TABELAS DE CONTEÚDO
-- =====================================================

-- Events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_events_church ON public.events(church_id);

-- Ministries
ALTER TABLE public.ministries ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ministries_church ON public.ministries(church_id);

-- Ministry Members
ALTER TABLE public.ministry_members ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_ministry_members_church ON public.ministry_members(church_id);

-- Gallery
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_gallery_church ON public.gallery(church_id);

-- Blog Posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_blog_posts_church ON public.blog_posts(church_id);

-- Blog Categories
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_blog_categories_church ON public.blog_categories(church_id);

-- Blog Tags
ALTER TABLE public.blog_tags ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_blog_tags_church ON public.blog_tags(church_id);

-- Service Schedules
ALTER TABLE public.service_schedules ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_service_schedules_church ON public.service_schedules(church_id);

-- Home Sections
ALTER TABLE public.home_sections ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_home_sections_church ON public.home_sections(church_id);

-- Contact Messages
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_contact_messages_church ON public.contact_messages(church_id);

-- Prayer Requests
ALTER TABLE public.prayer_requests ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_prayer_requests_church ON public.prayer_requests(church_id);

-- Site Settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_site_settings_church ON public.site_settings(church_id);

-- Theme Settings
ALTER TABLE public.theme_settings ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_theme_settings_church ON public.theme_settings(church_id);

-- Broadcast Messages
ALTER TABLE public.broadcast_messages ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_broadcast_messages_church ON public.broadcast_messages(church_id);

-- Chat Messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_chat_messages_church ON public.chat_messages(church_id);

-- Direct Messages
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_direct_messages_church ON public.direct_messages(church_id);

-- Entity Photos
ALTER TABLE public.entity_photos ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_entity_photos_church ON public.entity_photos(church_id);

-- In App Notifications
ALTER TABLE public.in_app_notifications ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_church ON public.in_app_notifications(church_id);

-- Push Subscriptions
ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_church ON public.push_subscriptions(church_id);

-- 4. FUNÇÕES HELPER PARA MULTI-TENANCY
-- =====================================================

-- Verifica se usuário é membro de uma igreja
CREATE OR REPLACE FUNCTION public.is_church_member_fn(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_members
    WHERE user_id = _user_id 
      AND church_id = _church_id 
      AND is_active = true
  )
$$;

-- Verifica se usuário é admin de uma igreja
CREATE OR REPLACE FUNCTION public.is_church_admin_fn(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_members
    WHERE user_id = _user_id 
      AND church_id = _church_id 
      AND role IN ('owner', 'admin')
      AND is_active = true
  )
$$;

-- Verifica se usuário é owner de uma igreja
CREATE OR REPLACE FUNCTION public.is_church_owner_fn(_user_id UUID, _church_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.church_members
    WHERE user_id = _user_id 
      AND church_id = _church_id 
      AND role = 'owner'
      AND is_active = true
  )
$$;

-- Verifica se usuário é platform_admin
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'platform_admin'
  )
$$;

-- Retorna as igrejas que o usuário é membro
CREATE OR REPLACE FUNCTION public.get_user_churches(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.church_members
  WHERE user_id = _user_id AND is_active = true
$$;

-- 5. HABILITAR RLS NAS NOVAS TABELAS
-- =====================================================
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_members ENABLE ROW LEVEL SECURITY;

-- 6. POLICIES PARA TABELA CHURCHES
-- =====================================================

-- Qualquer pessoa pode ver igrejas ativas (para landing page)
CREATE POLICY "Anyone can view active churches"
ON public.churches FOR SELECT
USING (status = 'active' OR is_platform_admin(auth.uid()));

-- Platform admins podem gerenciar todas as igrejas
CREATE POLICY "Platform admins can manage all churches"
ON public.churches FOR ALL
USING (is_platform_admin(auth.uid()));

-- Church owners podem atualizar sua igreja
CREATE POLICY "Church owners can update their church"
ON public.churches FOR UPDATE
USING (is_church_owner_fn(auth.uid(), id));

-- Usuários autenticados podem criar igrejas
CREATE POLICY "Authenticated users can create churches"
ON public.churches FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- 7. POLICIES PARA TABELA CHURCH_MEMBERS
-- =====================================================

-- Membros podem ver outros membros da mesma igreja
CREATE POLICY "Church members can view other members"
ON public.church_members FOR SELECT
USING (
  is_church_member_fn(auth.uid(), church_id) 
  OR is_platform_admin(auth.uid())
);

-- Church admins podem gerenciar membros
CREATE POLICY "Church admins can manage members"
ON public.church_members FOR ALL
USING (
  is_church_admin_fn(auth.uid(), church_id) 
  OR is_platform_admin(auth.uid())
);

-- Usuários podem se juntar a igrejas (com validação)
CREATE POLICY "Users can join churches"
ON public.church_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 8. ATUALIZAR POLICIES DAS TABELAS EXISTENTES PARA MULTI-TENANCY
-- =====================================================

-- Drop existing restrictive policies para events (vamos recriar)
DROP POLICY IF EXISTS "Anyone can view active events" ON public.events;
DROP POLICY IF EXISTS "Secretaria and admins can manage events" ON public.events;

-- Novas policies para events com suporte a multi-tenancy
CREATE POLICY "Anyone can view active church events"
ON public.events FOR SELECT
USING (
  is_active = true 
  OR is_church_admin_fn(auth.uid(), church_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Church admins can manage events"
ON public.events FOR ALL
USING (
  is_church_admin_fn(auth.uid(), church_id)
  OR is_platform_admin(auth.uid())
);

-- 9. FUNÇÃO PARA CRIAR IGREJA COM DADOS INICIAIS
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_church_with_defaults(
  p_name TEXT,
  p_slug TEXT,
  p_owner_id UUID,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_church_id UUID;
BEGIN
  -- Criar a igreja
  INSERT INTO public.churches (name, slug, owner_id, email, phone, description)
  VALUES (p_name, p_slug, p_owner_id, p_email, p_phone, p_description)
  RETURNING id INTO v_church_id;
  
  -- Adicionar owner como membro com role 'owner'
  INSERT INTO public.church_members (church_id, user_id, role)
  VALUES (v_church_id, p_owner_id, 'owner');
  
  -- Criar seções padrão da home
  INSERT INTO public.home_sections (church_id, section_key, title, subtitle, is_visible, sort_order) VALUES
    (v_church_id, 'hero', 'Bem-vindo à nossa igreja', 'Um lugar de fé, amor e comunhão', true, 1),
    (v_church_id, 'about', 'Sobre Nós', 'Conheça nossa história', true, 2),
    (v_church_id, 'events', 'Próximos Eventos', 'Participe das nossas atividades', true, 3),
    (v_church_id, 'ministries', 'Ministérios', 'Faça parte de um ministério', true, 4),
    (v_church_id, 'contact', 'Contato', 'Entre em contato conosco', true, 5);
  
  -- Criar configurações padrão do site
  INSERT INTO public.site_settings (church_id, key, value) VALUES
    (v_church_id, 'general', jsonb_build_object('churchName', p_name, 'slogan', 'Bem-vindo à nossa igreja'));
  
  -- Criar configurações padrão de tema
  INSERT INTO public.theme_settings (church_id, active_theme) VALUES
    (v_church_id, 'royal-blue-gold');
  
  RETURN v_church_id;
END;
$$;