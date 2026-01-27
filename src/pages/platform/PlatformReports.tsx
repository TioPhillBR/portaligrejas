import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChurchData {
  id: string;
  plan: string;
  status: string;
  created_at: string;
}

interface SubscriptionHistory {
  id: string;
  church_id: string;
  old_plan: string | null;
  new_plan: string;
  change_type: string;
  mrr_change: number;
  created_at: string;
}

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  prata: 69,
  ouro: 119,
  diamante: 189,
};

const PLAN_COLORS: Record<string, string> = {
  free: "#9CA3AF",
  prata: "#64748B",
  ouro: "#EAB308",
  diamante: "#A855F7",
};

const PlatformReports = () => {
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("6");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [churchesRes, historyRes] = await Promise.all([
        supabase.from("churches").select("id, plan, status, created_at"),
        supabase.from("subscription_history").select("*").order("created_at", { ascending: true }),
      ]);

      if (churchesRes.error) throw churchesRes.error;
      setChurches(churchesRes.data || []);
      setHistory(historyRes.data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeChurches = churches.filter((c) => c.status === "active");
    const paidChurches = activeChurches.filter((c) => c.plan && c.plan !== "free");

    // Current MRR
    const currentMRR = paidChurches.reduce(
      (sum, c) => sum + (PLAN_PRICES[c.plan] || 0),
      0
    );

    // Plan distribution
    const planDistribution = Object.entries(PLAN_PRICES).map(([plan, price]) => ({
      name: plan.charAt(0).toUpperCase() + plan.slice(1),
      value: churches.filter((c) => (c.plan || "free") === plan).length,
      color: PLAN_COLORS[plan],
    }));

    // Monthly MRR data
    const monthsToShow = parseInt(period);
    const startDate = startOfMonth(subMonths(new Date(), monthsToShow - 1));
    const endDate = endOfMonth(new Date());
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const mrrByMonth = months.map((month) => {
      const monthEnd = endOfMonth(month);
      
      // Get churches that existed by this month
      const existingChurches = churches.filter(
        (c) => new Date(c.created_at) <= monthEnd
      );
      
      // Calculate MRR for this month (simplified - would need historical data for accuracy)
      const monthMRR = existingChurches
        .filter((c) => c.status === "active" && c.plan && c.plan !== "free")
        .reduce((sum, c) => sum + (PLAN_PRICES[c.plan] || 0), 0);

      return {
        month: format(month, "MMM", { locale: ptBR }),
        mrr: monthMRR,
        churches: existingChurches.length,
      };
    });

    // Calculate churn (churches that went from paid to free or suspended)
    const churnEvents = history.filter(
      (h) => h.change_type === "cancelled" || h.change_type === "downgrade"
    );
    const monthlyChurnRate =
      paidChurches.length > 0
        ? ((churnEvents.length / paidChurches.length) * 100).toFixed(1)
        : 0;

    // Growth metrics
    const previousMonthMRR = mrrByMonth[mrrByMonth.length - 2]?.mrr || 0;
    const mrrGrowth =
      previousMonthMRR > 0
        ? (((currentMRR - previousMonthMRR) / previousMonthMRR) * 100).toFixed(1)
        : 0;

    // Revenue forecast (simple linear projection)
    const avgGrowthRate = mrrByMonth.length > 1
      ? mrrByMonth.reduce((acc, curr, i, arr) => {
          if (i === 0) return 0;
          const prev = arr[i - 1].mrr;
          return acc + (prev > 0 ? ((curr.mrr - prev) / prev) : 0);
        }, 0) / (mrrByMonth.length - 1)
      : 0;

    const forecastMonths = 3;
    const forecast = Array.from({ length: forecastMonths }, (_, i) => ({
      month: format(subMonths(new Date(), -(i + 1)), "MMM", { locale: ptBR }),
      mrr: Math.round(currentMRR * Math.pow(1 + avgGrowthRate, i + 1)),
      isProjection: true,
    }));

    return {
      currentMRR,
      mrrGrowth,
      totalChurches: churches.length,
      activeChurches: activeChurches.length,
      paidChurches: paidChurches.length,
      conversionRate:
        churches.length > 0
          ? ((paidChurches.length / churches.length) * 100).toFixed(1)
          : 0,
      monthlyChurnRate,
      planDistribution,
      mrrByMonth,
      forecast,
      arpu: paidChurches.length > 0 ? currentMRR / paidChurches.length : 0,
    };
  }, [churches, history, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análises e métricas de receita da plataforma
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {metrics.currentMRR.toFixed(2).replace(".", ",")}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {Number(metrics.mrrGrowth) >= 0 ? (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">+{metrics.mrrGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">{metrics.mrrGrowth}%</span>
                </>
              )}
              <span className="ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.paidChurches} de {metrics.totalChurches} igrejas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthlyChurnRate}%</div>
            <p className="text-xs text-muted-foreground">cancelamentos mensais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.arpu.toFixed(2).replace(".", ",")}
            </div>
            <p className="text-xs text-muted-foreground">receita média por cliente</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mrr" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mrr">Evolução do MRR</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição por Plano</TabsTrigger>
          <TabsTrigger value="forecast">Previsão de Receita</TabsTrigger>
        </TabsList>

        {/* MRR Evolution Chart */}
        <TabsContent value="mrr">
          <Card>
            <CardHeader>
              <CardTitle>Evolução do MRR</CardTitle>
              <CardDescription>
                Receita mensal recorrente ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics.mrrByMonth}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      tickFormatter={(value) => `R$ ${value}`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        `R$ ${value.toFixed(2)}`,
                        "MRR",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mrr"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Distribution */}
        <TabsContent value="distribution">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Plano</CardTitle>
                <CardDescription>Quantidade de igrejas em cada plano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.planDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {metrics.planDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receita por Plano</CardTitle>
                <CardDescription>Contribuição de cada plano para o MRR</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics.planDistribution.filter((p) => p.name !== "Free")}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `R$ ${v}`} />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => {
                          const planName = props.payload.name.toLowerCase();
                          const price = PLAN_PRICES[planName] || 0;
                          const revenue = (value as number) * price;
                          return [`R$ ${revenue.toFixed(2)}`, "Receita"];
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Forecast */}
        <TabsContent value="forecast">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Previsão de Receita
              </CardTitle>
              <CardDescription>
                Projeção baseada na taxa de crescimento atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[...metrics.mrrByMonth.slice(-3), ...metrics.forecast]}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis
                      tickFormatter={(value) => `R$ ${value}`}
                      className="text-xs"
                    />
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `R$ ${value.toFixed(2)}`,
                        props.payload.isProjection ? "Projeção" : "MRR Real",
                      ]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mrr"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary" />
                  <span className="text-muted-foreground">MRR Real</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5 bg-primary border-dashed border-t-2 border-primary" />
                  <span className="text-muted-foreground">Projeção</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformReports;
