-- Add unique constraint for event_id + user_id to allow upsert
ALTER TABLE public.event_attendees 
ADD CONSTRAINT event_attendees_event_user_unique UNIQUE (event_id, user_id);