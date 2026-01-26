-- Create event_attendees table for RSVP
CREATE TABLE public.event_attendees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'maybe', 'declined')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for event_attendees
CREATE POLICY "Anyone can view event attendees"
ON public.event_attendees
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can RSVP to events"
ON public.event_attendees
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVP"
ON public.event_attendees
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVP"
ON public.event_attendees
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_event_attendees_updated_at
    BEFORE UPDATE ON public.event_attendees
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update profiles RLS to allow members to see other public members
CREATE POLICY "Public members can view other public members"
ON public.profiles
FOR SELECT
USING (is_public_member = true AND auth.uid() IS NOT NULL);