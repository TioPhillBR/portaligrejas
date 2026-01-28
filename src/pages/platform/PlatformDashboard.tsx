import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Church, Users, TrendingUp, CreditCard, Ticket, Gift, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DashboardStats {
  totalChurches: number;
  activeChurches: number;
  totalUsers: number;
  totalSubscriptions: number;
}

interface CouponStats {
  totalCoupons: number;
  activeCoupons: number;
  totalCouponUses: number;
  totalDiscount: number;
}

interface FreeAccountStats {
  totalGranted: number;
  usedAccounts: number;
  pendingAccounts: number;
}

interface CouponUseTrend {
  date: string;
  uses: number;
  discount: number;
}

const PlatformDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalChurches: 0,
    activeChurches: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
  });
  const [couponStats, setCouponStats] = useState<CouponStats>({
    totalCoupons: 0,
    activeCoupons: 0,
    totalCouponUses: 0,
    totalDiscount: 0,
  });
  const [freeAccountStats, setFreeAccountStats] = useState<FreeAccountStats>({
    totalGranted: 0,
    usedAccounts: 0,
    pendingAccounts: 0,
  });
  const [couponTrend, setCouponTrend] = useState<CouponUseTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get date range for trend (last 30 days)
      const endDate = endOfDay(new Date());
      const startDate = startOfDay(subDays(new Date(), 29));

      // Fetch all stats in parallel
      const [
        totalChurchesRes,
        activeChurchesRes,
        totalUsersRes,
        totalSubscriptionsRes,
        couponsRes,
        activeCouponsRes,
        couponUsesRes,
        grantedAccountsRes,
        usedAccountsRes,
        couponTrendRes,
      ] = await Promise.all([
        // Church stats
        supabase.from("churches").select("*", { count: "exact", head: true }),
        supabase.from("churches").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("churches").select("*", { count: "exact", head: true }).in("plan", ["prata", "ouro", "diamante"]),
        // Coupon stats
        supabase.from("discount_coupons").select("*", { count: "exact", head: true }),
        supabase.from("discount_coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("coupon_uses").select("discount_applied"),
        // Free account stats
        supabase.from("granted_free_accounts").select("*", { count: "exact", head: true }),
        supabase.from("granted_free_accounts").select("*", { count: "exact", head: true }).eq("is_used", true),
        // Coupon trend data
        supabase
          .from("coupon_uses")
          .select("used_at, discount_applied")
          .gte("used_at", startDate.toISOString())
          .lte("used_at", endDate.toISOString())
          .order("used_at", { ascending: true }),
      ]);

      // Calculate total discount from coupon uses
      const totalDiscount = couponUsesRes.data?.reduce((sum, use) => sum + (use.discount_applied || 0), 0) || 0;

      setStats({
        totalChurches: totalChurchesRes.count || 0,
        activeChurches: activeChurchesRes.count || 0,
        totalUsers: totalUsersRes.count || 0,
        totalSubscriptions: totalSubscriptionsRes.count || 0,
      });

      setCouponStats({
        totalCoupons: couponsRes.count || 0,
        activeCoupons: activeCouponsRes.count || 0,
        totalCouponUses: couponUsesRes.data?.length || 0,
        totalDiscount,
      });

      const totalGranted = grantedAccountsRes.count || 0;
      const usedAccounts = usedAccountsRes.count || 0;

      setFreeAccountStats({
        totalGranted,
        usedAccounts,
        pendingAccounts: totalGranted - usedAccounts,
      });

      // Process coupon trend data - group by day
      const trendData = processCouponTrend(couponTrendRes.data || [], startDate, endDate);
      setCouponTrend(trendData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const processCouponTrend = (
    data: { used_at: string | null; discount_applied: number }[],
    startDate: Date,
    endDate: Date
  ): CouponUseTrend[] => {
    // Create a map with all days in range initialized to 0
    const dayMap = new Map<string, { uses: number; discount: number }>();
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, "yyyy-MM-dd");
      dayMap.set(dateKey, { uses: 0, discount: 0 });
    }

    // Aggregate data by day
    data.forEach((item) => {
      if (item.used_at) {
        const dateKey = format(new Date(item.used_at), "yyyy-MM-dd");
        const existing = dayMap.get(dateKey);
        if (existing) {
          dayMap.set(dateKey, {
            uses: existing.uses + 1,
            discount: existing.discount + (item.discount_applied || 0),
          });
        }
      }
    });

    // Convert to array
    return Array.from(dayMap.entries()).map(([date, values]) => ({
      date: format(new Date(date), "dd/MM", { locale: ptBR }),
      uses: values.uses,
      discount: values.discount,
    }));
  };

  const statCards = [
    {
      title: "Total de Igrejas",
      value: stats.totalChurches,
      icon: Church,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Igrejas Ativas",
      value: stats.activeChurches,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total de Usuários",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Assinaturas Pagas",
      value: stats.totalSubscriptions,
      icon: CreditCard,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard da Plataforma</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard da Plataforma</h1>
        <p className="text-muted-foreground">
          Visão geral de todas as igrejas cadastradas no Portal Igrejas
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("w-5 h-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Coupons & Free Accounts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coupon Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                Cupons de Desconto
              </CardTitle>
              <CardDescription>Estatísticas de uso de cupons</CardDescription>
            </div>
            <Link
              to="/plataforma/cupons"
              className="text-sm text-primary hover:underline"
            >
              Gerenciar →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total de Cupons</p>
                <p className="text-2xl font-bold text-foreground">{couponStats.totalCoupons}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cupons Ativos</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600">{couponStats.activeCoupons}</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Vezes Utilizados</p>
                <p className="text-2xl font-bold text-foreground">{couponStats.totalCouponUses}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total em Descontos</p>
                <p className="text-2xl font-bold text-amber-600">
                  R$ {couponStats.totalDiscount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Free Accounts Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Contas Gratuitas
              </CardTitle>
              <CardDescription>Gratuidades concedidas a igrejas</CardDescription>
            </div>
            <Link
              to="/plataforma/cupons"
              className="text-sm text-primary hover:underline"
            >
              Gerenciar →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Concedidas</p>
                <p className="text-2xl font-bold text-foreground">{freeAccountStats.totalGranted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Utilizadas</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600">{freeAccountStats.usedAccounts}</p>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-amber-600">{freeAccountStats.pendingAccounts}</p>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>

            {freeAccountStats.totalGranted > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Taxa de Conversão</span>
                  <span className="font-medium text-foreground">
                    {((freeAccountStats.usedAccounts / freeAccountStats.totalGranted) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{
                      width: `${(freeAccountStats.usedAccounts / freeAccountStats.totalGranted) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coupon Usage Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Tendência de Uso de Cupons
          </CardTitle>
          <CardDescription>Uso de cupons nos últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {couponTrend.some((d) => d.uses > 0) ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={couponTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    className="text-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [
                      name === "uses" ? value : `R$ ${value.toFixed(2)}`,
                      name === "uses" ? "Usos" : "Desconto",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="uses"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="uses"
                  />
                  <Line
                    type="monotone"
                    dataKey="discount"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name="discount"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Ticket className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Nenhum uso de cupom nos últimos 30 dias</p>
                <p className="text-sm">Os dados aparecerão aqui quando cupons forem utilizados</p>
              </div>
            </div>
          )}
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Quantidade de Usos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-muted-foreground">Valor em Descontos (R$)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformDashboard;
