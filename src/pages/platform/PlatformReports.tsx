import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Users, ArrowUpRight, ArrowDownRight, BarChart3, FileDown, FileSpreadsheet, Activity, Grid3X3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useReportExport } from "@/hooks/useReportExport";
import CohortAnalysis from "@/components/platform/CohortAnalysis";
import RetentionMetrics from "@/components/platform/RetentionMetrics";
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
  name: string;
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

interface PaymentData {
  id: string;
  church_id: string;
  amount: number;
  status: string;
  paid_at: string | null;
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
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const { exportToPDF, exportToExcel } = useReportExport();
  const [period, setPeriod] = useState("6");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [churchesRes, historyRes, paymentsRes] = await Promise.all([
        supabase.from("churches").select("id, name, plan, status, created_at"),
        supabase.from("subscription_history").select("*").order("created_at", { ascending: true }),
        supabase.from("payment_history").select("id, church_id, amount, status, paid_at, created_at").eq("status", "paid"),
      ]);

      if (churchesRes.error) throw churchesRes.error;
      setChurches(churchesRes.data || []);
      setHistory(historyRes.data || []);
      setPayments(paymentsRes.data || []);
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

    // Calculate LTV per church
    const ltvByChurch = churches
      .filter((c) => c.plan && c.plan !== "free")
      .map((church) => {
        // Sum all paid payments for this church
        const churchPayments = payments.filter((p) => p.church_id === church.id);
        const totalRevenue = churchPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // Calculate months as customer
        const startDate = new Date(church.created_at);
        const monthsAsCustomer = Math.max(1, 
          Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        );
        
        // Calculate average monthly value
        const avgMonthlyValue = totalRevenue > 0 ? totalRevenue / monthsAsCustomer : PLAN_PRICES[church.plan] || 0;
        
        return {
          churchId: church.id,
          churchName: church.name,
          plan: church.plan,
          totalRevenue,
          monthsAsCustomer,
          avgMonthlyValue,
          estimatedLTV: avgMonthlyValue * 24, // Estimate 24 months lifetime
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Average LTV
    const avgLTV = ltvByChurch.length > 0
      ? ltvByChurch.reduce((sum, c) => sum + c.estimatedLTV, 0) / ltvByChurch.length
      : 0;

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
      ltvByChurch,
      avgLTV,
    };
  }, [churches, history, payments, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleExportPDF = () => {
    exportToPDF(metrics);
    toast.success("Relatório PDF gerado com sucesso!");
  };

  const handleExportExcel = () => {
    exportToExcel(metrics);
    toast.success("Relatório Excel gerado com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">
            Análises e métricas de receita da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <FileDown className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Excel
          </Button>
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
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="mrr">Evolução do MRR</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição por Plano</TabsTrigger>
          <TabsTrigger value="retention" className="gap-1">
            <Activity className="h-3 w-3" />
            Retenção
          </TabsTrigger>
          <TabsTrigger value="cohort" className="gap-1">
            <Grid3X3 className="h-3 w-3" />
            Cohort
          </TabsTrigger>
          <TabsTrigger value="ltv">LTV por Cliente</TabsTrigger>
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

        {/* Retention Metrics */}
        <TabsContent value="retention">
          <RetentionMetrics churches={churches} history={history} />
        </TabsContent>

        {/* Cohort Analysis */}
        <TabsContent value="cohort">
          <CohortAnalysis churches={churches} history={history} />
        </TabsContent>

        {/* LTV per Client */}
        <TabsContent value="ltv">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Value por Cliente</CardTitle>
              <CardDescription>
                LTV médio estimado: R$ {metrics.avgLTV.toFixed(2).replace(".", ",")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Igreja</th>
                      <th className="text-left py-3 px-2">Plano</th>
                      <th className="text-right py-3 px-2">Receita Total</th>
                      <th className="text-right py-3 px-2">Meses</th>
                      <th className="text-right py-3 px-2">Média/Mês</th>
                      <th className="text-right py-3 px-2">LTV Est. (24m)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.ltvByChurch.slice(0, 20).map((church) => (
                      <tr key={church.churchId} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{church.churchName}</td>
                        <td className="py-3 px-2 capitalize">{church.plan}</td>
                        <td className="py-3 px-2 text-right">R$ {church.totalRevenue.toFixed(2).replace(".", ",")}</td>
                        <td className="py-3 px-2 text-right">{church.monthsAsCustomer}</td>
                        <td className="py-3 px-2 text-right">R$ {church.avgMonthlyValue.toFixed(2).replace(".", ",")}</td>
                        <td className="py-3 px-2 text-right font-semibold text-green-600">
                          R$ {church.estimatedLTV.toFixed(2).replace(".", ",")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {metrics.ltvByChurch.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum cliente pagante encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
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
