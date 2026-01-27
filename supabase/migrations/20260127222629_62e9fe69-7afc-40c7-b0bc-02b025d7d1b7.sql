-- Create table to track section/page views
CREATE TABLE public.section_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid REFERENCES public.churches(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  page_path text NOT NULL,
  user_id uuid,
  session_id text,
  device_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_section_views_church_created ON public.section_views(church_id, created_at DESC);
CREATE INDEX idx_section_views_section ON public.section_views(church_id, section_key);

-- Enable RLS
ALTER TABLE public.section_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (anonymous tracking)
CREATE POLICY "Anyone can insert section views"
ON public.section_views
FOR INSERT
WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view section views"
ON public.section_views
FOR SELECT
USING (is_church_admin_fn(auth.uid(), church_id) OR is_platform_admin(auth.uid()));

-- Create function to notify on event RSVP
CREATE OR REPLACE FUNCTION public.notify_event_rsvp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event record;
  v_user_name text;
  v_church_id uuid;
BEGIN
  -- Get event details
  SELECT e.*, e.church_id INTO v_event
  FROM public.events e
  WHERE e.id = NEW.event_id;

  -- Get user name
  SELECT full_name INTO v_user_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Notify church admins about new RSVP
  INSERT INTO public.in_app_notifications (user_id, church_id, title, message, type, reference_type, reference_id)
  SELECT 
    cm.user_id,
    v_event.church_id,
    'Nova confirmação de presença',
    COALESCE(v_user_name, 'Um membro') || ' confirmou presença no evento "' || v_event.title || '"',
    'event',
    'event',
    NEW.event_id
  FROM public.church_members cm
  WHERE cm.church_id = v_event.church_id
    AND cm.role IN ('owner', 'admin')
    AND cm.is_active = true;

  RETURN NEW;
END;
$$;

-- Create trigger for event RSVP notifications
DROP TRIGGER IF EXISTS on_event_rsvp ON public.event_attendees;
CREATE TRIGGER on_event_rsvp
  AFTER INSERT ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_event_rsvp();

-- Create function to notify on prayer request
CREATE OR REPLACE FUNCTION public.notify_prayer_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Notify church admins about new prayer request
  INSERT INTO public.in_app_notifications (user_id, church_id, title, message, type, reference_type, reference_id)
  SELECT 
    cm.user_id,
    NEW.church_id,
    'Novo pedido de oração',
    'Um novo pedido de oração foi enviado. Clique para visualizar.',
    'prayer',
    'prayer_request',
    NEW.id
  FROM public.church_members cm
  WHERE cm.church_id = NEW.church_id
    AND cm.role IN ('owner', 'admin')
    AND cm.is_active = true;

  RETURN NEW;
END;
$$;

-- Create trigger for prayer request notifications
DROP TRIGGER IF EXISTS on_prayer_request ON public.prayer_requests;
CREATE TRIGGER on_prayer_request
  AFTER INSERT ON public.prayer_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_prayer_request();