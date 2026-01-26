-- =============================================
-- ENUM TYPES
-- =============================================

-- User roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'lider_ministerio', 'secretaria', 'midia', 'comunicacao');

-- =============================================
-- PROFILES TABLE
-- =============================================

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- USER ROLES TABLE
-- =============================================

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  ministry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'
  )
$$;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION public.has_any_admin_role(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_admin_role(auth.uid()));

-- =============================================
-- SERVICE SCHEDULES TABLE
-- =============================================

CREATE TABLE public.service_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week TEXT NOT NULL,
  time TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'Users',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service schedules"
  ON public.service_schedules FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage service schedules"
  ON public.service_schedules FOR ALL
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

-- =============================================
-- EVENTS TABLE
-- =============================================

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  end_date DATE,
  location TEXT,
  category TEXT DEFAULT 'Evento',
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Secretaria and admins can manage events"
  ON public.events FOR ALL
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'secretaria')
  );

-- =============================================
-- MINISTRIES TABLE
-- =============================================

CREATE TABLE public.ministries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'Users',
  color TEXT DEFAULT 'from-blue-500 to-blue-600',
  image_url TEXT,
  leader_name TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active ministries"
  ON public.ministries FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage ministries"
  ON public.ministries FOR ALL
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

-- =============================================
-- GALLERY TABLE
-- =============================================

CREATE TABLE public.gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'Geral',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gallery items"
  ON public.gallery FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Midia can manage gallery"
  ON public.gallery FOR ALL
  TO authenticated
  USING (
    public.is_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'midia')
  );

-- =============================================
-- PRAYER REQUESTS TABLE
-- =============================================

CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit prayer requests (anonymous)
CREATE POLICY "Anyone can submit prayer requests"
  ON public.prayer_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view prayer requests
CREATE POLICY "Admins can view prayer requests"
  ON public.prayer_requests FOR SELECT
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can update prayer requests"
  ON public.prayer_requests FOR UPDATE
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

-- =============================================
-- CONTACT MESSAGES TABLE
-- =============================================

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.has_any_admin_role(auth.uid()));

-- =============================================
-- TRIGGERS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_schedules_updated_at
  BEFORE UPDATE ON public.service_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
  ('general', '{"church_name": "Igreja Luz do Evangelho", "phone": "(11) 3456-7890", "whatsapp": "5511999999999", "email": "contato@igrejaluz.com.br", "address": "Rua da Paz, 123 - Centro, São Paulo - SP"}'),
  ('social', '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com"}'),
  ('radio', '{"stream_url": "https://stream.zeno.fm/4d8z8h8dff8uv", "name": "Rádio Luz do Evangelho"}'),
  ('video', '{"youtube_id": "dQw4w9WgXcQ", "title": "Vídeo Institucional"}'),
  ('donations', '{"pix_key": "contato@igrejaluz.com.br", "pix_type": "email", "bank_name": "Banco do Brasil", "bank_code": "001", "agency": "1234-5", "account": "12345-6", "holder": "Igreja Luz do Evangelho", "cnpj": "12.345.678/0001-90"}');

-- Insert default service schedules
INSERT INTO public.service_schedules (day_of_week, time, name, icon, sort_order) VALUES
  ('Domingo', '09:00', 'Escola Bíblica Dominical', 'BookOpen', 1),
  ('Domingo', '18:00', 'Culto da Família', 'Users', 2),
  ('Terça-feira', '19:30', 'Culto de Oração', 'Heart', 3),
  ('Quarta-feira', '19:30', 'Estudo Bíblico', 'BookOpen', 4),
  ('Quinta-feira', '19:30', 'Culto de Louvor', 'Music', 5),
  ('Sexta-feira', '19:30', 'Culto dos Jovens', 'Users', 6),
  ('Sábado', '16:00', 'Culto Infantil', 'Baby', 7);

-- Insert default ministries
INSERT INTO public.ministries (name, description, icon, color, sort_order) VALUES
  ('Ministério de Louvor', 'Levando adoração ao coração de Deus através da música e do louvor congregacional.', 'Music', 'from-blue-500 to-blue-600', 1),
  ('Ministério de Jovens', 'Conectando a nova geração com o propósito de Deus para suas vidas.', 'Users', 'from-purple-500 to-purple-600', 2),
  ('Ministério de Mulheres', 'Fortalecendo mulheres para serem instrumentos de Deus em suas famílias e comunidades.', 'Heart', 'from-pink-500 to-pink-600', 3),
  ('Ministério Infantil', 'Ensinando as crianças a conhecerem e amarem a Deus desde cedo.', 'Baby', 'from-orange-500 to-orange-600', 4),
  ('Ministério de Ensino', 'Discipulando através do estudo aprofundado da Palavra de Deus.', 'BookOpen', 'from-green-500 to-green-600', 5),
  ('Ministério de Ação Social', 'Levando o amor de Cristo às pessoas em situação de vulnerabilidade.', 'Hand', 'from-red-500 to-red-600', 6);