-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_categories
CREATE POLICY "Anyone can view active categories"
ON public.blog_categories
FOR SELECT
USING (is_active = true OR has_any_admin_role(auth.uid()));

CREATE POLICY "Admins can manage categories"
ON public.blog_categories
FOR ALL
USING (has_any_admin_role(auth.uid()));

-- Add scheduled_at column to blog_posts
ALTER TABLE public.blog_posts 
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE;

-- Add category_id to blog_posts (foreign key to blog_categories)
ALTER TABLE public.blog_posts 
ADD COLUMN category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.blog_categories (name, slug, description, color, sort_order) VALUES
('Geral', 'geral', 'Artigos gerais da igreja', '#6B7280', 0),
('Devocional', 'devocional', 'Mensagens devocionais diárias', '#10B981', 1),
('Estudos Bíblicos', 'estudos-biblicos', 'Estudos aprofundados da Bíblia', '#3B82F6', 2),
('Testemunhos', 'testemunhos', 'Testemunhos de membros', '#F59E0B', 3),
('Notícias', 'noticias', 'Notícias e atualizações da igreja', '#EF4444', 4);