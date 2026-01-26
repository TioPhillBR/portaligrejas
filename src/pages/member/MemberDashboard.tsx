import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, MessageCircle, Bell, ChevronRight, User, Calendar, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Ministry {
  id: string;
  name: string;
  color: string;
}

interface BroadcastMessage {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string | null;
}

const MemberDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [myMinistries, setMyMinistries] = useState<Ministry[]>([]);
  const [recentBroadcasts, setRecentBroadcasts] = useState<BroadcastMessage[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch my ministries
      const { data: membershipData } = await supabase
        .from("ministry_members")
        .select(`
          ministry_id,
          ministries (id, name, color)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (membershipData) {
        const ministries = membershipData
          .map((m: any) => m.ministries)
          .filter(Boolean) as Ministry[];
        setMyMinistries(ministries);
      }

      // Fetch recent broadcasts
      const { data: broadcastData } = await supabase
        .from("broadcast_messages")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (broadcastData) {
        setRecentBroadcasts(broadcastData);
      }

      // Fetch upcoming events
      const today = new Date().toISOString().split('T')[0];
      const { data: eventsData } = await supabase
        .from("events")
        .select("id, title, date, time")
        .eq("is_active", true)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(3);

      if (eventsData) {
        setUpcomingEvents(eventsData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl md:text-3xl font-display font-bold">
          {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Membro"}! 👋
        </h1>
        <p className="mt-2 opacity-90">
          Bem-vindo à sua área de membro. Aqui você pode participar dos grupos e acompanhar as novidades da igreja.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/membro/perfil">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Meu Perfil</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/membro/eventos">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Eventos</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/membro/ministerios">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Ministérios</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/membro/grupos">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Grupos</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/membro/avisos">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Avisos</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/membro/buscar">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium">Buscar Membros</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Próximos Eventos</CardTitle>
            <Link to="/membro/eventos">
              <Button variant="ghost" size="sm">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  to="/membro/eventos"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center text-primary">
                    <span className="text-xs font-medium">
                      {format(new Date(event.date), "MMM", { locale: ptBR }).toUpperCase()}
                    </span>
                    <span className="text-lg font-bold">
                      {format(new Date(event.date), "d")}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    {event.time && (
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    )}
                  </div>
                  {isToday(new Date(event.date)) && (
                    <Badge>Hoje</Badge>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* My Ministries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Meus Ministérios</CardTitle>
            <Link to="/membro/ministerios">
              <Button variant="ghost" size="sm">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {myMinistries.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Você ainda não participa de nenhum ministério</p>
                <Link to="/membro/ministerios">
                  <Button variant="link" className="mt-2">
                    Explorar ministérios
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {myMinistries.slice(0, 4).map((ministry) => (
                  <Link
                    key={ministry.id}
                    to={`/membro/grupos/${ministry.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${ministry.color} flex items-center justify-center text-white font-bold`}>
                      {ministry.name.charAt(0)}
                    </div>
                    <span className="font-medium">{ministry.name}</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Avisos Recentes</CardTitle>
            <Link to="/membro/avisos">
              <Button variant="ghost" size="sm">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentBroadcasts.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum aviso recente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBroadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="p-3 rounded-lg bg-muted/50"
                  >
                    {broadcast.title && (
                      <h4 className="font-medium text-sm">{broadcast.title}</h4>
                    )}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {broadcast.content}
                    </p>
                    <span className="text-xs text-muted-foreground mt-2 block">
                      {new Date(broadcast.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
