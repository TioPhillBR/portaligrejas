import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Users, 
  Image, 
  MessageSquare, 
  Heart, 
  Clock,
  TrendingUp,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SetupChecklist from "@/components/admin/SetupChecklist";

interface DashboardStats {
  events: number;
  ministries: number;
  galleryItems: number;
  messages: number;
  prayerRequests: number;
  schedules: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    events: 0,
    ministries: 0,
    galleryItems: 0,
    messages: 0,
    prayerRequests: 0,
    schedules: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: eventsCount },
        { count: ministriesCount },
        { count: galleryCount },
        { count: messagesCount },
        { count: prayerCount },
        { count: schedulesCount },
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("ministries").select("*", { count: "exact", head: true }),
        supabase.from("gallery").select("*", { count: "exact", head: true }),
        supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("prayer_requests").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("service_schedules").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        events: eventsCount || 0,
        ministries: ministriesCount || 0,
        galleryItems: galleryCount || 0,
        messages: messagesCount || 0,
        prayerRequests: prayerCount || 0,
        schedules: schedulesCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Eventos", value: stats.events, icon: Calendar, color: "text-blue-500" },
    { label: "Ministérios", value: stats.ministries, icon: Users, color: "text-purple-500" },
    { label: "Fotos na Galeria", value: stats.galleryItems, icon: Image, color: "text-green-500" },
    { label: "Horários de Culto", value: stats.schedules, icon: Clock, color: "text-orange-500" },
    { label: "Mensagens não lidas", value: stats.messages, icon: MessageSquare, color: "text-red-500", highlight: stats.messages > 0 },
    { label: "Pedidos de oração", value: stats.prayerRequests, icon: Heart, color: "text-pink-500", highlight: stats.prayerRequests > 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Setup Checklist */}
      <SetupChecklist />

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo ao painel administrativo da Igreja Luz do Evangelho
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={stat.highlight ? "border-destructive/50 bg-destructive/5" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="/admin/eventos"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Calendar className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Novo Evento</span>
            </a>
            <a
              href="/admin/galeria"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Image className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Adicionar Fotos</span>
            </a>
            <a
              href="/admin/mensagens"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Ver Mensagens</span>
            </a>
            <a
              href="/"
              target="_blank"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <Eye className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium">Ver Site</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
