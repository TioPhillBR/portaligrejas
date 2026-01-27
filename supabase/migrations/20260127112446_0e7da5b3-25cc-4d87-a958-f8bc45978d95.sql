-- Create in-app notifications table
CREATE TABLE public.in_app_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    reference_type TEXT,
    reference_id UUID,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.in_app_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.in_app_notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.in_app_notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can create notifications"
ON public.in_app_notifications FOR INSERT
WITH CHECK (has_any_admin_role(auth.uid()));

-- Create entity_photos table for photos linked to events/ministries
CREATE TABLE public.entity_photos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.entity_photos ENABLE ROW LEVEL SECURITY;

-- Policies for entity_photos
CREATE POLICY "Anyone can view entity photos"
ON public.entity_photos FOR SELECT
USING (true);

CREATE POLICY "Admins can manage entity photos"
ON public.entity_photos FOR ALL
USING (has_any_admin_role(auth.uid()));

-- Create index for efficient querying
CREATE INDEX idx_entity_photos_entity ON public.entity_photos(entity_type, entity_id);
CREATE INDEX idx_notifications_user_unread ON public.in_app_notifications(user_id, is_read) WHERE is_read = false;