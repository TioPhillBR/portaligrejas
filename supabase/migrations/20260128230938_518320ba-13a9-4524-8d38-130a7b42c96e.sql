-- Drop the incorrect unique constraint on section_key (should be unique per church, not globally)
ALTER TABLE public.home_sections DROP CONSTRAINT IF EXISTS home_sections_section_key_key;

-- Create the correct unique constraint: section_key should be unique per church
ALTER TABLE public.home_sections ADD CONSTRAINT home_sections_church_section_unique UNIQUE (church_id, section_key);