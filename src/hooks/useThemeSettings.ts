import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  "primary-foreground": string;
  gold: string;
  "gold-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  border: string;
  card: string;
  "card-foreground": string;
}

export interface ThemeSettings {
  id: string;
  active_theme: string;
  light_colors: ThemeColors;
  dark_colors: ThemeColors;
  updated_at: string;
}

export const presetThemes = {
  "royal-blue-gold": {
    name: "Azul Royal e Dourado",
    light: {
      background: "0 0% 100%",
      foreground: "220 30% 10%",
      primary: "224 76% 37%",
      "primary-foreground": "0 0% 100%",
      gold: "43 74% 52%",
      "gold-foreground": "220 30% 10%",
      secondary: "220 20% 96%",
      "secondary-foreground": "220 30% 10%",
      muted: "220 14% 96%",
      "muted-foreground": "220 10% 45%",
      accent: "220 14% 96%",
      "accent-foreground": "220 30% 10%",
      border: "220 14% 90%",
      card: "0 0% 100%",
      "card-foreground": "220 30% 10%",
    },
    dark: {
      background: "220 30% 6%",
      foreground: "0 0% 98%",
      primary: "224 76% 55%",
      "primary-foreground": "0 0% 100%",
      gold: "43 80% 55%",
      "gold-foreground": "220 30% 6%",
      secondary: "220 25% 15%",
      "secondary-foreground": "0 0% 98%",
      muted: "220 25% 15%",
      "muted-foreground": "220 10% 60%",
      accent: "220 25% 18%",
      "accent-foreground": "0 0% 98%",
      border: "220 25% 18%",
      card: "220 30% 10%",
      "card-foreground": "0 0% 98%",
    },
  },
  "forest-bronze": {
    name: "Verde Floresta e Bronze",
    light: {
      background: "0 0% 100%",
      foreground: "160 30% 10%",
      primary: "142 76% 28%",
      "primary-foreground": "0 0% 100%",
      gold: "30 60% 45%",
      "gold-foreground": "0 0% 100%",
      secondary: "160 20% 96%",
      "secondary-foreground": "160 30% 10%",
      muted: "160 14% 96%",
      "muted-foreground": "160 10% 45%",
      accent: "160 14% 96%",
      "accent-foreground": "160 30% 10%",
      border: "160 14% 90%",
      card: "0 0% 100%",
      "card-foreground": "160 30% 10%",
    },
    dark: {
      background: "160 30% 6%",
      foreground: "0 0% 98%",
      primary: "142 76% 42%",
      "primary-foreground": "0 0% 100%",
      gold: "30 70% 52%",
      "gold-foreground": "160 30% 6%",
      secondary: "160 25% 15%",
      "secondary-foreground": "0 0% 98%",
      muted: "160 25% 15%",
      "muted-foreground": "160 10% 60%",
      accent: "160 25% 18%",
      "accent-foreground": "0 0% 98%",
      border: "160 25% 18%",
      card: "160 30% 10%",
      "card-foreground": "0 0% 98%",
    },
  },
  "amethyst-silver": {
    name: "Roxo Ametista e Prata",
    light: {
      background: "0 0% 100%",
      foreground: "262 30% 10%",
      primary: "262 83% 48%",
      "primary-foreground": "0 0% 100%",
      gold: "0 0% 70%",
      "gold-foreground": "262 30% 10%",
      secondary: "262 20% 96%",
      "secondary-foreground": "262 30% 10%",
      muted: "262 14% 96%",
      "muted-foreground": "262 10% 45%",
      accent: "262 14% 96%",
      "accent-foreground": "262 30% 10%",
      border: "262 14% 90%",
      card: "0 0% 100%",
      "card-foreground": "262 30% 10%",
    },
    dark: {
      background: "262 30% 6%",
      foreground: "0 0% 98%",
      primary: "262 83% 62%",
      "primary-foreground": "0 0% 100%",
      gold: "0 0% 78%",
      "gold-foreground": "262 30% 6%",
      secondary: "262 25% 15%",
      "secondary-foreground": "0 0% 98%",
      muted: "262 25% 15%",
      "muted-foreground": "262 10% 60%",
      accent: "262 25% 18%",
      "accent-foreground": "0 0% 98%",
      border: "262 25% 18%",
      card: "262 30% 10%",
      "card-foreground": "0 0% 98%",
    },
  },
};

const applyThemeColors = (colors: ThemeColors, isDark: boolean) => {
  const root = document.documentElement;
  const prefix = isDark ? "" : "";
  
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
};

export const useThemeSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;
      
      return {
        id: data.id,
        active_theme: data.active_theme,
        light_colors: data.light_colors as unknown as ThemeColors,
        dark_colors: data.dark_colors as unknown as ThemeColors,
        updated_at: data.updated_at,
      } as ThemeSettings;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { active_theme?: string; light_colors?: ThemeColors; dark_colors?: ThemeColors }) => {
      if (!settings?.id) throw new Error("No theme settings found");
      
      const updateData: Record<string, unknown> = {};
      if (updates.active_theme !== undefined) {
        updateData.active_theme = updates.active_theme;
      }
      if (updates.light_colors !== undefined) {
        updateData.light_colors = updates.light_colors;
      }
      if (updates.dark_colors !== undefined) {
        updateData.dark_colors = updates.dark_colors;
      }
      
      const { error } = await supabase
        .from("theme_settings")
        .update(updateData)
        .eq("id", settings.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateTheme: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
};

export const useApplyTheme = () => {
  const { settings } = useThemeSettings();

  useEffect(() => {
    if (!settings) return;

    const isDark = document.documentElement.classList.contains("dark");
    const colors = isDark ? settings.dark_colors : settings.light_colors;
    
    if (colors) {
      applyThemeColors(colors as ThemeColors, isDark);
    }

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDarkNow = document.documentElement.classList.contains("dark");
          const newColors = isDarkNow ? settings.dark_colors : settings.light_colors;
          if (newColors) {
            applyThemeColors(newColors as ThemeColors, isDarkNow);
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [settings]);
};
