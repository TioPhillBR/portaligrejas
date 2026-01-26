-- Create blog_tags table
CREATE TABLE public.blog_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create junction table for posts and tags (many-to-many)
CREATE TABLE public.blog_post_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS policies for blog_tags
CREATE POLICY "Anyone can view tags" ON public.blog_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage tags" ON public.blog_tags FOR ALL USING (has_any_admin_role(auth.uid()));

-- RLS policies for blog_post_tags
CREATE POLICY "Anyone can view post tags" ON public.blog_post_tags FOR SELECT USING (true);
CREATE POLICY "Admins can manage post tags" ON public.blog_post_tags FOR ALL USING (has_any_admin_role(auth.uid()));

-- Add some default tags
INSERT INTO public.blog_tags (name, slug, color) VALUES
  ('Fé', 'fe', '#3B82F6'),
  ('Família', 'familia', '#10B981'),
  ('Oração', 'oracao', '#8B5CF6'),
  ('Louvor', 'louvor', '#F59E0B'),
  ('Estudos Bíblicos', 'estudos-biblicos', '#EC4899');