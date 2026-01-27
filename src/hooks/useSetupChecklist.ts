import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChurch } from "@/contexts/ChurchContext";

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  isCompleted: boolean;
  checkFunction?: () => Promise<boolean>;
}

const STORAGE_KEY = "setup-checklist-dismissed";

export function useSetupChecklist() {
  const { church } = useChurch();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkItems = useCallback(async () => {
    if (!church?.id) return;

    setLoading(true);

    try {
      // Check all items in parallel
      const [
        logoCheck,
        schedulesCheck,
        eventCheck,
        ministryCheck,
        galleryCheck,
        settingsCheck,
      ] = await Promise.all([
        // 1. Check if church has logo
        Promise.resolve(!!church.logo_url),

        // 2. Check if there are service schedules
        supabase
          .from("service_schedules")
          .select("id", { count: "exact", head: true })
          .eq("church_id", church.id)
          .eq("is_active", true)
          .then(({ count }) => (count || 0) > 0),

        // 3. Check if there's at least one event
        supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("church_id", church.id)
          .eq("is_active", true)
          .then(({ count }) => (count || 0) > 0),

        // 4. Check if there's at least one ministry
        supabase
          .from("ministries")
          .select("id", { count: "exact", head: true })
          .eq("church_id", church.id)
          .eq("is_active", true)
          .then(({ count }) => (count || 0) > 0),

        // 5. Check if there are photos in gallery
        supabase
          .from("gallery")
          .select("id", { count: "exact", head: true })
          .eq("church_id", church.id)
          .eq("is_active", true)
          .then(({ count }) => (count || 0) > 0),

        // 6. Check if basic settings are configured
        supabase
          .from("site_settings")
          .select("value")
          .eq("church_id", church.id)
          .eq("key", "general")
          .single()
          .then(({ data }) => {
            if (!data?.value) return false;
            const settings = data.value as Record<string, unknown>;
            return !!(settings.churchName && settings.slogan);
          }),
      ]);

      const checklist: ChecklistItem[] = [
        {
          id: "logo",
          label: "Adicionar logo da igreja",
          description: "Upload do logo que aparecerá no site e app",
          href: "/admin/configuracoes",
          isCompleted: logoCheck,
        },
        {
          id: "settings",
          label: "Configurar informações básicas",
          description: "Nome, slogan e dados de contato da igreja",
          href: "/admin/configuracoes",
          isCompleted: settingsCheck,
        },
        {
          id: "schedules",
          label: "Cadastrar horários de culto",
          description: "Defina os dias e horários das reuniões",
          href: "/admin/horarios",
          isCompleted: schedulesCheck,
        },
        {
          id: "event",
          label: "Criar primeiro evento",
          description: "Adicione um evento para sua comunidade",
          href: "/admin/eventos",
          isCompleted: eventCheck,
        },
        {
          id: "ministry",
          label: "Cadastrar um ministério",
          description: "Organize os ministérios da igreja",
          href: "/admin/ministerios",
          isCompleted: ministryCheck,
        },
        {
          id: "gallery",
          label: "Adicionar fotos na galeria",
          description: "Compartilhe momentos especiais",
          href: "/admin/galeria",
          isCompleted: galleryCheck,
        },
      ];

      setItems(checklist);
    } catch (error) {
      console.error("Error checking setup items:", error);
    } finally {
      setLoading(false);
    }
  }, [church]);

  useEffect(() => {
    // Check if dismissed
    const dismissed = localStorage.getItem(`${STORAGE_KEY}-${church?.id}`);
    if (dismissed === "true") {
      setIsDismissed(true);
    }

    checkItems();
  }, [checkItems, church?.id]);

  const dismissChecklist = useCallback(() => {
    if (church?.id) {
      localStorage.setItem(`${STORAGE_KEY}-${church.id}`, "true");
      setIsDismissed(true);
    }
  }, [church?.id]);

  const resetChecklist = useCallback(() => {
    if (church?.id) {
      localStorage.removeItem(`${STORAGE_KEY}-${church.id}`);
      setIsDismissed(false);
    }
  }, [church?.id]);

  const completedCount = items.filter((item) => item.isCompleted).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const isAllCompleted = completedCount === totalCount;

  return {
    items,
    loading,
    isDismissed,
    completedCount,
    totalCount,
    progress,
    isAllCompleted,
    dismissChecklist,
    resetChecklist,
    refreshChecklist: checkItems,
  };
}
