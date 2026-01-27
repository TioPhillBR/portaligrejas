import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useChurch } from "@/contexts/ChurchContext";
import { BarChart3, TrendingUp, Smartphone, Monitor, Tablet, Eye } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SectionData {
  section_key: string;
  views: number;
  unique_sessions: number;
}

interface DailyData {
  date: string;
  views: number;
}

interface DeviceData {
  device_type: string;
  count: number;
}

const SECTION_LABELS: Record<string, string> = {
  home: "Página Inicial",
  about: "Sobre Nós",
  events: "Eventos",
  "events-page": "Página de Eventos",
  ministries: "Ministérios",
  "ministries-page": "Página de Ministérios",
  gallery: "Galeria",
  contact: "Contato",
  schedule: "Horários",
  blog: "Blog",
};

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function EngagementAnalytics() {
  const { church } = useChurch();
  const [period, setPeriod] = useState("7");
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueSessions, setUniqueSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (church?.id) {
      fetchAnalytics();
    }
  }, [church?.id, period]);

  const fetchAnalytics = async () => {
    if (!church?.id) return;
    setLoading(true);

    const startDate = startOfDay(subDays(new Date(), parseInt(period)));
    const endDate = endOfDay(new Date());

    try {
      // Fetch all views in the period
      const { data: views } = await supabase
        .from("section_views")
        .select("section_key, session_id, device_type, created_at")
        .eq("church_id", church.id)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString());

      if (!views) {
        setLoading(false);
        return;
      }

      // Calculate total views and unique sessions
      setTotalViews(views.length);
      const uniqueSessionsSet = new Set(views.map((v) => v.session_id));
      setUniqueSessions(uniqueSessionsSet.size);

      // Group by section
      const sectionCounts: Record<string, { views: number; sessions: Set<string> }> = {};
      views.forEach((v) => {
        if (!sectionCounts[v.section_key]) {
          sectionCounts[v.section_key] = { views: 0, sessions: new Set() };
        }
        sectionCounts[v.section_key].views++;
        if (v.session_id) {
          sectionCounts[v.section_key].sessions.add(v.session_id);
        }
      });

      const sectionArray: SectionData[] = Object.entries(sectionCounts)
        .map(([section_key, data]) => ({
          section_key,
          views: data.views,
          unique_sessions: data.sessions.size,
        }))
        .sort((a, b) => b.views - a.views);

      setSectionData(sectionArray);

      // Group by date
      const dailyCounts: Record<string, number> = {};
      views.forEach((v) => {
        const date = format(new Date(v.created_at), "yyyy-MM-dd");
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      const dailyArray: DailyData[] = [];
      for (let i = parseInt(period); i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        dailyArray.push({
          date: format(new Date(date), "dd/MM", { locale: ptBR }),
          views: dailyCounts[date] || 0,
        });
      }
      setDailyData(dailyArray);

      // Group by device
      const deviceCounts: Record<string, number> = {};
      views.forEach((v) => {
        const device = v.device_type || "desktop";
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      });

      const deviceArray: DeviceData[] = Object.entries(deviceCounts).map(
        ([device_type, count]) => ({ device_type, count })
      );
      setDeviceData(deviceArray);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics de Engajamento</h2>
          <p className="text-muted-foreground">
            Acompanhe quais seções do site são mais visitadas
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="14">Últimos 14 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Visualizações</p>
                <p className="text-2xl font-bold">{totalViews}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sessões Únicas</p>
                <p className="text-2xl font-bold">{uniqueSessions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seções Visitadas</p>
                <p className="text-2xl font-bold">{sectionData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Smartphone className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visualizações/Sessão</p>
                <p className="text-2xl font-bold">
                  {uniqueSessions > 0 ? (totalViews / uniqueSessions).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Por Seção</TabsTrigger>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seções Mais Visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              {sectionData.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma visualização registrada no período selecionado
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectionData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="section_key"
                        width={120}
                        tickFormatter={(value) => SECTION_LABELS[value] || value}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.[0]) return null;
                          const data = payload[0].payload as SectionData;
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">
                                {SECTION_LABELS[data.section_key] || data.section_key}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {data.views} visualizações
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {data.unique_sessions} sessões únicas
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sections List */}
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Seções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectionData.slice(0, 10).map((section, index) => (
                  <div
                    key={section.section_key}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor:
                          index < 3 ? `hsl(var(--primary) / ${1 - index * 0.2})` : "hsl(var(--muted))",
                        color: index < 3 ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {SECTION_LABELS[section.section_key] || section.section_key}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {section.unique_sessions} visitantes únicos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{section.views}</p>
                      <p className="text-xs text-muted-foreground">visualizações</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                      name="Visualizações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deviceData}
                        dataKey="count"
                        nameKey="device_type"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ device_type, percent }) =>
                          `${DEVICE_LABELS[device_type] || device_type} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {deviceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.[0]) return null;
                          const data = payload[0].payload as DeviceData;
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">
                                {DEVICE_LABELS[data.device_type] || data.device_type}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {data.count} visualizações
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device) => {
                    const percentage = totalViews > 0 ? (device.count / totalViews) * 100 : 0;
                    return (
                      <div key={device.device_type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DeviceIcon type={device.device_type} />
                            <span className="font-medium">
                              {DEVICE_LABELS[device.device_type] || device.device_type}
                            </span>
                          </div>
                          <span className="text-muted-foreground">
                            {device.count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
