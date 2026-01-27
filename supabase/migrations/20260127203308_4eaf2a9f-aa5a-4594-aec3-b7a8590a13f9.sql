-- =====================================================
-- FASE 1A: ADICIONAR NOVOS ROLES AO ENUM
-- =====================================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'platform_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'church_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'church_admin';