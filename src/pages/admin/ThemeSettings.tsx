import { useState, useEffect } from "react";
import { Check, Palette, Sun, Moon, RotateCcw, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useThemeSettings, presetThemes, ThemeColors } from "@/hooks/useThemeSettings";

const colorLabels: Record<keyof ThemeColors, string> = {
  background: "Fundo",
  foreground: "Texto Principal",
  primary: "Cor Primária",
  "primary-foreground": "Texto da Primária",
  gold: "Cor Destaque (Ouro)",
  "gold-foreground": "Texto do Destaque",
  secondary: "Secundário",
  "secondary-foreground": "Texto Secundário",
  muted: "Suave",
  "muted-foreground": "Texto Suave",
  accent: "Acento",
  "accent-foreground": "Texto Acento",
  border: "Bordas",
  card: "Cards",
  "card-foreground": "Texto Cards",
};

const hslToHex = (hslString: string): string => {
  const parts = hslString.split(" ").map((p) => parseFloat(p));
  if (parts.length < 3) return "#888888";
  
  const h = parts[0] / 360;
  const s = parts[1] / 100;
  const l = parts[2] / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsl = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "0 0% 50%";

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const ColorInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const hexValue = hslToHex(value);

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-sm">{label}</Label>
        <div className="flex gap-2 mt-1">
          <div
            className="w-10 h-10 rounded-lg border cursor-pointer overflow-hidden"
            style={{ backgroundColor: `hsl(${value})` }}
          >
            <input
              type="color"
              value={hexValue}
              onChange={(e) => onChange(hexToHsl(e.target.value))}
              className="w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="H S% L%"
            className="font-mono text-xs"
          />
        </div>
      </div>
    </div>
  );
};

const ThemePreview = ({ colors, name }: { colors: ThemeColors; name: string }) => (
  <div 
    className="rounded-lg border p-4 space-y-3"
    style={{
      backgroundColor: `hsl(${colors.background})`,
      borderColor: `hsl(${colors.border})`,
    }}
  >
    <div className="flex items-center gap-2">
      <div 
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: `hsl(${colors.primary})` }}
      />
      <div 
        className="w-4 h-4 rounded-full"
        style={{ backgroundColor: `hsl(${colors.gold})` }}
      />
      <span 
        className="text-sm font-medium"
        style={{ color: `hsl(${colors.foreground})` }}
      >
        {name}
      </span>
    </div>
    <div 
      className="rounded p-2"
      style={{ backgroundColor: `hsl(${colors.card})` }}
    >
      <span 
        className="text-xs"
        style={{ color: `hsl(${colors["card-foreground"]})` }}
      >
        Card de exemplo
      </span>
    </div>
    <div className="flex gap-2">
      <div 
        className="rounded px-2 py-1 text-xs"
        style={{ 
          backgroundColor: `hsl(${colors.primary})`,
          color: `hsl(${colors["primary-foreground"]})`
        }}
      >
        Primário
      </div>
      <div 
        className="rounded px-2 py-1 text-xs"
        style={{ 
          backgroundColor: `hsl(${colors.gold})`,
          color: `hsl(${colors["gold-foreground"]})`
        }}
      >
        Destaque
      </div>
    </div>
  </div>
);

// Live Preview Component - shows a full preview of the site with current colors
const LiveSitePreview = ({ lightColors, darkColors, isDark }: { lightColors: ThemeColors; darkColors: ThemeColors; isDark: boolean }) => {
  const colors = isDark ? darkColors : lightColors;
  
  return (
    <div 
      className="rounded-xl border overflow-hidden shadow-lg"
      style={{
        backgroundColor: `hsl(${colors.background})`,
        borderColor: `hsl(${colors.border})`,
      }}
    >
      {/* Fake Header */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid hsl(${colors.border})` }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full"
            style={{ backgroundColor: `hsl(${colors.gold})` }}
          />
          <span 
            className="font-bold text-sm"
            style={{ color: `hsl(${colors.foreground})` }}
          >
            Igreja Luz
          </span>
        </div>
        <div className="flex gap-4">
          {["Início", "Sobre", "Eventos"].map((item) => (
            <span 
              key={item}
              className="text-xs"
              style={{ color: `hsl(${colors["muted-foreground"]})` }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Fake Hero */}
      <div 
        className="p-6 text-center"
        style={{ 
          background: `linear-gradient(to bottom, hsl(${colors.primary}), hsl(${colors.primary}) 80%)` 
        }}
      >
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs mb-3"
          style={{ 
            backgroundColor: `hsl(${colors.gold} / 0.3)`,
            color: `hsl(${colors.gold})` 
          }}
        >
          ✦ Bem-vindo ✦
        </span>
        <h2 
          className="text-xl font-bold mb-2"
          style={{ color: `hsl(${colors["primary-foreground"]})` }}
        >
          Nossa Igreja
        </h2>
        <p 
          className="text-xs opacity-80 mb-4"
          style={{ color: `hsl(${colors["primary-foreground"]})` }}
        >
          Um lugar de fé e amor
        </p>
        <div className="flex gap-2 justify-center">
          <div 
            className="px-4 py-2 rounded text-xs font-medium"
            style={{ 
              backgroundColor: `hsl(${colors.gold})`,
              color: `hsl(${colors["gold-foreground"]})` 
            }}
          >
            Conheça
          </div>
          <div 
            className="px-4 py-2 rounded text-xs font-medium border"
            style={{ 
              borderColor: `hsl(${colors["primary-foreground"]} / 0.3)`,
              color: `hsl(${colors["primary-foreground"]})` 
            }}
          >
            Horários
          </div>
        </div>
      </div>

      {/* Fake Cards Section */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div 
            key={i}
            className="rounded-lg p-3"
            style={{ 
              backgroundColor: `hsl(${colors.card})`,
              border: `1px solid hsl(${colors.border})` 
            }}
          >
            <div 
              className="w-6 h-6 rounded mb-2"
              style={{ backgroundColor: `hsl(${colors.primary} / 0.2)` }}
            />
            <div 
              className="h-2 rounded mb-1"
              style={{ backgroundColor: `hsl(${colors.foreground} / 0.8)`, width: "70%" }}
            />
            <div 
              className="h-2 rounded"
              style={{ backgroundColor: `hsl(${colors["muted-foreground"]} / 0.5)`, width: "50%" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminThemeSettings = () => {
  const { settings, isLoading, updateTheme, isUpdating } = useThemeSettings();
  const [activeTheme, setActiveTheme] = useState("royal-blue-gold");
  const [lightColors, setLightColors] = useState<ThemeColors | null>(null);
  const [darkColors, setDarkColors] = useState<ThemeColors | null>(null);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
  const [previewDarkMode, setPreviewDarkMode] = useState(false);

  useEffect(() => {
    if (settings) {
      setActiveTheme(settings.active_theme);
      setLightColors(settings.light_colors as ThemeColors);
      setDarkColors(settings.dark_colors as ThemeColors);
    }
  }, [settings]);

  // Apply live preview to the page
  useEffect(() => {
    if (!livePreviewEnabled || !lightColors || !darkColors) return;

    const applyPreviewColors = (colors: ThemeColors, selector: string) => {
      const root = document.querySelector(selector) as HTMLElement;
      if (!root) return;

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    };

    // Apply light theme colors to :root
    applyPreviewColors(lightColors, ":root");

    // Apply dark theme colors
    let darkStyleEl = document.getElementById("preview-dark-theme");
    if (!darkStyleEl) {
      darkStyleEl = document.createElement("style");
      darkStyleEl.id = "preview-dark-theme";
      document.head.appendChild(darkStyleEl);
    }

    const darkCssVars = Object.entries(darkColors)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n    ");

    darkStyleEl.textContent = `.dark {\n    ${darkCssVars}\n  }`;
  }, [lightColors, darkColors, livePreviewEnabled]);

  const handleApplyPreset = (presetKey: string) => {
    const preset = presetThemes[presetKey as keyof typeof presetThemes];
    if (!preset) return;

    setActiveTheme(presetKey);
    setLightColors(preset.light);
    setDarkColors(preset.dark);
    
    toast.info("Paleta aplicada! Veja o preview e clique em Salvar para confirmar.");
  };

  const handleUpdateLightColor = (key: keyof ThemeColors, value: string) => {
    if (!lightColors) return;
    setLightColors({ ...lightColors, [key]: value });
  };

  const handleUpdateDarkColor = (key: keyof ThemeColors, value: string) => {
    if (!darkColors) return;
    setDarkColors({ ...darkColors, [key]: value });
  };

  const handleSave = () => {
    if (!lightColors || !darkColors) return;
    
    updateTheme({
      active_theme: activeTheme,
      light_colors: lightColors,
      dark_colors: darkColors,
    }, {
      onSuccess: () => {
        toast.success("Tema salvo com sucesso!");
      },
      onError: () => {
        toast.error("Erro ao salvar tema");
      },
    });
  };

  const handleResetToDefault = () => {
    const preset = presetThemes["royal-blue-gold"];
    setActiveTheme("royal-blue-gold");
    setLightColors(preset.light);
    setDarkColors(preset.dark);
    toast.info("Cores resetadas para o padrão. Clique em Salvar para confirmar.");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações de Tema</h1>
          <p className="text-muted-foreground">
            Personalize as cores do site para modo claro e escuro
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="live-preview" className="text-sm">Preview ao Vivo</Label>
            <Switch 
              id="live-preview"
              checked={livePreviewEnabled}
              onCheckedChange={setLivePreviewEnabled}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="presets" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="presets" className="gap-2">
                <Palette className="h-4 w-4" />
                Paletas Prontas
              </TabsTrigger>
              <TabsTrigger value="light" className="gap-2">
                <Sun className="h-4 w-4" />
                Tema Claro
              </TabsTrigger>
              <TabsTrigger value="dark" className="gap-2">
                <Moon className="h-4 w-4" />
                Tema Escuro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="presets" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(presetThemes).map(([key, preset]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      activeTheme === key ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleApplyPreset(key)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{preset.name}</CardTitle>
                        {activeTheme === key && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Claro</p>
                          <ThemePreview colors={preset.light} name="Light" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Escuro</p>
                          <ThemePreview colors={preset.dark} name="Dark" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="light" className="space-y-6">
              {lightColors && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cores do Tema Claro</CardTitle>
                    <CardDescription>
                      Personalize cada cor individualmente. Use formato HSL (H S% L%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(Object.keys(colorLabels) as Array<keyof ThemeColors>).map((key) => (
                        <ColorInput
                          key={key}
                          label={colorLabels[key]}
                          value={lightColors[key]}
                          onChange={(value) => handleUpdateLightColor(key, value)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="dark" className="space-y-6">
              {darkColors && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cores do Tema Escuro</CardTitle>
                    <CardDescription>
                      Personalize cada cor individualmente. Use formato HSL (H S% L%)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {(Object.keys(colorLabels) as Array<keyof ThemeColors>).map((key) => (
                        <ColorInput
                          key={key}
                          label={colorLabels[key]}
                          value={darkColors[key]}
                          onChange={(value) => handleUpdateDarkColor(key, value)}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleResetToDefault}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar para Padrão
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Preview do Site</CardTitle>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4" />
                  <Switch 
                    checked={previewDarkMode}
                    onCheckedChange={setPreviewDarkMode}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
              <CardDescription>
                {previewDarkMode ? "Modo Escuro" : "Modo Claro"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lightColors && darkColors && (
                <LiveSitePreview 
                  lightColors={lightColors}
                  darkColors={darkColors}
                  isDark={previewDarkMode}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminThemeSettings;
