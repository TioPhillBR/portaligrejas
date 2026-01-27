-- Add view_count to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create function to notify all members about new events
CREATE OR REPLACE FUNCTION public.notify_new_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notification for all users with profiles
  INSERT INTO public.in_app_notifications (user_id, title, message, type, reference_type, reference_id)
  SELECT 
    p.user_id,
    'Novo Evento: ' || NEW.title,
    COALESCE(
      SUBSTRING(NEW.description FROM 1 FOR 100) || CASE WHEN LENGTH(NEW.description) > 100 THEN '...' ELSE '' END,
      'Confira os detalhes do novo evento!'
    ),
    'event',
    'event',
    NEW.id
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL;
  
  RETURN NEW;
END;
$$;

-- Create trigger to notify on new events
DROP TRIGGER IF EXISTS trigger_notify_new_event ON public.events;
CREATE TRIGGER trigger_notify_new_event
  AFTER INSERT ON public.events
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.notify_new_event();

-- Create function to increment view count
CREATE OR REPLACE FUNCTION public.increment_event_views(event_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.events 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = event_id;
$$;