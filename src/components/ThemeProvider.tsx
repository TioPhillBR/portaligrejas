import { useApplyTheme } from "@/hooks/useApplyTheme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  // This hook applies the theme colors from the database
  useApplyTheme();
  
  return <>{children}</>;
};
