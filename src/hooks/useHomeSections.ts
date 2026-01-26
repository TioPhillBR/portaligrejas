import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HomeSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
}

export const useHomeSections = () => {
  return useQuery({
    queryKey: ["home-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_sections")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomeSection[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useHomeSection = (sectionKey: string) => {
  const { data: sections, ...rest } = useHomeSections();
  const section = sections?.find((s) => s.section_key === sectionKey);
  return { section, ...rest };
};
