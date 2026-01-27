import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, UserMinus, UserPlus, RefreshCw } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

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

interface RetentionMetricsProps {
  churches: ChurchData[];
  history: SubscriptionHistory[];
}

export const RetentionMetrics = ({ churches, history }: RetentionMetricsProps) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Active churches at start of current month
    const activeAtStart = churches.filter((c) => {
      const createdDate = new Date(c.created_at);
      return createdDate < currentMonthStart && c.status === "active" && c.plan !== "free";
    }).length;

    // New paid signups this month
    const newSignups = churches.filter((c) => {
      const createdDate = new Date(c.created_at);
      return createdDate >= currentMonthStart && createdDate <= currentMonthEnd && c.plan !== "free";
    }).length;

    // Churned this month
    const churnedThisMonth = history.filter((h) => {
      const changeDate = new Date(h.created_at);
      return (
        changeDate >= currentMonthStart &&
        changeDate <= currentMonthEnd &&
        (h.change_type === "cancelled" || (h.change_type === "downgrade" && h.new_plan === "free"))
      );
    }).length;

    // Upgrades this month
    const upgradesThisMonth = history.filter((h) => {
      const changeDate = new Date(h.created_at);
      return changeDate >= currentMonthStart && changeDate <= currentMonthEnd && h.change_type === "upgrade";
    }).length;

    // Downgrades this month (excluding cancellations to free)
    const downgradesThisMonth = history.filter((h) => {
      const changeDate = new Date(h.created_at);
      return (
        changeDate >= currentMonthStart &&
        changeDate <= currentMonthEnd &&
        h.change_type === "downgrade" &&
        h.new_plan !== "free"
      );
    }).length;

    // Calculate retention rate
    const retentionRate = activeAtStart > 0 
      ? ((activeAtStart - churnedThisMonth) / activeAtStart) * 100 
      : 100;

    // Net Revenue Retention (NRR)
    const startMRR = activeAtStart * 100; // Simplified
    const expansionMRR = upgradesThisMonth * 50; // Simplified estimate
    const contractionMRR = downgradesThisMonth * 30; // Simplified estimate
    const churnMRR = churnedThisMonth * 100; // Simplified estimate
    const endMRR = startMRR + expansionMRR - contractionMRR - churnMRR;
    const nrr = startMRR > 0 ? (endMRR / startMRR) * 100 : 100;

    // Last month metrics for comparison
    const churnedLastMonth = history.filter((h) => {
      const changeDate = new Date(h.created_at);
      return (
        changeDate >= lastMonthStart &&
        changeDate <= lastMonthEnd &&
        (h.change_type === "cancelled" || (h.change_type === "downgrade" && h.new_plan === "free"))
      );
    }).length;

    const churnTrend = churnedLastMonth > 0 
      ? ((churnedThisMonth - churnedLastMonth) / churnedLastMonth) * 100 
      : 0;

    // Customer Health Score (simplified)
    const healthScore = Math.min(100, Math.max(0, 
      (retentionRate * 0.4) + 
      ((upgradesThisMonth / Math.max(1, activeAtStart)) * 100 * 0.3) + 
      ((1 - (churnedThisMonth / Math.max(1, activeAtStart))) * 100 * 0.3)
    ));

    return {
      activeAtStart,
      newSignups,
      churnedThisMonth,
      churnedLastMonth,
      upgradesThisMonth,
      downgradesThisMonth,
      retentionRate,
      nrr,
      churnTrend,
      healthScore,
      currentMonth: format(now, "MMMM", { locale: ptBR }),
    };
  }, [churches, history]);

  return (
    <div className="space-y-4">
      {/* Main Retention Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.retentionRate.toFixed(1)}%
            </div>
            <Progress value={metrics.retentionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2 capitalize">
              {metrics.currentMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue Retention</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.nrr >= 100 ? "text-green-600" : "text-amber-600"}`}>
              {metrics.nrr.toFixed(1)}%
            </div>
            <Progress value={Math.min(100, metrics.nrr)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.nrr >= 100 ? "Expansão positiva" : "Contração detectada"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saúde do Cliente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              metrics.healthScore >= 70 ? "text-green-600" : 
              metrics.healthScore >= 50 ? "text-amber-600" : "text-red-600"
            }`}>
              {metrics.healthScore.toFixed(0)}
            </div>
            <Progress 
              value={metrics.healthScore} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.healthScore >= 70 ? "Saudável" : 
               metrics.healthScore >= 50 ? "Atenção" : "Crítico"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentação de Clientes</CardTitle>
          <CardDescription className="capitalize">Resumo de {metrics.currentMonth}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-green-500/20">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.newSignups}</p>
                <p className="text-xs text-muted-foreground">Novos clientes</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-blue-500/20">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.upgradesThisMonth}</p>
                <p className="text-xs text-muted-foreground">Upgrades</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-amber-500/20">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.downgradesThisMonth}</p>
                <p className="text-xs text-muted-foreground">Downgrades</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-red-500/20">
                <UserMinus className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">{metrics.churnedThisMonth}</p>
                  {metrics.churnTrend !== 0 && (
                    <span className={`text-xs ${metrics.churnTrend > 0 ? "text-red-500" : "text-green-500"}`}>
                      {metrics.churnTrend > 0 ? "+" : ""}{metrics.churnTrend.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Cancelamentos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RetentionMetrics;
