import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ThemeColors {
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

interface ThemeSettings {
  id: string;
  active_theme: string;
  light_colors: ThemeColors;
  dark_colors: ThemeColors;
}

const defaultLightColors: ThemeColors = {
  background: "0 0% 100%",
  foreground: "220 30% 10%",
  primary: "224 76% 37%",
  "primary-foreground": "0 0% 100%",
  gold: "43 74% 52%",
  "gold-foreground": "0 0% 10%",
  secondary: "220 20% 96%",
  "secondary-foreground": "220 30% 10%",
  muted: "220 14% 96%",
  "muted-foreground": "220 10% 45%",
  accent: "220 14% 96%",
  "accent-foreground": "220 30% 10%",
  border: "220 14% 90%",
  card: "0 0% 100%",
  "card-foreground": "220 30% 10%",
};

const defaultDarkColors: ThemeColors = {
  background: "220 30% 6%",
  foreground: "0 0% 98%",
  primary: "224 76% 55%",
  "primary-foreground": "0 0% 100%",
  gold: "43 80% 55%",
  "gold-foreground": "0 0% 10%",
  secondary: "220 25% 15%",
  "secondary-foreground": "0 0% 98%",
  muted: "220 25% 15%",
  "muted-foreground": "220 10% 60%",
  accent: "220 25% 18%",
  "accent-foreground": "0 0% 98%",
  border: "220 25% 18%",
  card: "220 30% 10%",
  "card-foreground": "0 0% 98%",
};

export const useApplyTheme = () => {
  const { data: themeSettings } = useQuery({
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
      } as ThemeSettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const applyTheme = useCallback(() => {
    const lightColors = themeSettings?.light_colors || defaultLightColors;
    const darkColors = themeSettings?.dark_colors || defaultDarkColors;
    
    // Create or update the dynamic theme style element
    let styleEl = document.getElementById("dynamic-theme-colors");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "dynamic-theme-colors";
      document.head.appendChild(styleEl);
    }

    // Generate CSS for light theme (applied to :root)
    const lightCssVars = Object.entries(lightColors as ThemeColors)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n    ");

    // Generate CSS for dark theme (applied to .dark)
    const darkCssVars = Object.entries(darkColors as ThemeColors)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n    ");

    // Apply both themes with higher specificity
    styleEl.textContent = `
  :root {
    ${lightCssVars}
  }
  .dark {
    ${darkCssVars}
  }
`;
  }, [themeSettings]);

  // Apply theme on settings change
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Listen for theme toggle changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          // Force re-render when dark class changes
          applyTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [applyTheme]);

  return { themeSettings };
};
