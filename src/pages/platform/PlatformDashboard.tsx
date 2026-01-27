import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Church, Users, TrendingUp, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalChurches: number;
  activeChurches: number;
  totalUsers: number;
  totalSubscriptions: number;
}

const PlatformDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalChurches: 0,
    activeChurches: 0,
    totalUsers: 0,
    totalSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch total churches
      const { count: totalChurches } = await supabase
        .from("churches")
        .select("*", { count: "exact", head: true });

      // Fetch active churches
      const { count: activeChurches } = await supabase
        .from("churches")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch total users (profiles)
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch paid subscriptions
      const { count: totalSubscriptions } = await supabase
        .from("churches")
        .select("*", { count: "exact", head: true })
        .in("plan", ["prata", "ouro", "diamante"]);

      setStats({
        totalChurches: totalChurches || 0,
        activeChurches: activeChurches || 0,
        totalUsers: totalUsers || 0,
        totalSubscriptions: totalSubscriptions || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

// Helper function for class names
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(" ");

export default PlatformDashboard;
