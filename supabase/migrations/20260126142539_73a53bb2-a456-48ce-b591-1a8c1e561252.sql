-- =============================================
-- STORAGE BUCKETS FOR IMAGES
-- =============================================

-- Create bucket for church images (gallery, events, ministries)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'church-images',
  'church-images',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for church-images bucket
CREATE POLICY "Anyone can view church images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'church-images');

CREATE POLICY "Authenticated users with admin role can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'church-images' AND
  public.has_any_admin_role(auth.uid())
);

CREATE POLICY "Authenticated users with admin role can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'church-images' AND
  public.has_any_admin_role(auth.uid())
);

CREATE POLICY "Authenticated users with admin role can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'church-images' AND
  public.has_any_admin_role(auth.uid())
);