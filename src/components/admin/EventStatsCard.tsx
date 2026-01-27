import { useQuery } from "@tanstack/react-query";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface EventStats {
  totalEvents: number;
  totalViews: number;
  totalRsvps: number;
  upcomingEvents: number;
}

const EventStatsCard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["event-stats"],
    queryFn: async (): Promise<EventStats> => {
      // Get total events and views
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, view_count, date");
      
      if (eventsError) throw eventsError;

      // Get total RSVPs
      const { count: rsvpCount, error: rsvpError } = await supabase
        .from("event_attendees")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed");
      
      if (rsvpError) throw rsvpError;

      const today = new Date().toISOString().split("T")[0];
      const upcomingEvents = events?.filter((e) => e.date >= today).length || 0;
      const totalViews = events?.reduce((sum, e) => sum + (e.view_count || 0), 0) || 0;

      return {
        totalEvents: events?.length || 0,
        totalViews,
        totalRsvps: rsvpCount || 0,
        upcomingEvents,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="h-16 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Total de Eventos",
      value: stats?.totalEvents || 0,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Eventos Futuros",
      value: stats?.upcomingEvents || 0,
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total de Visualizações",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Confirmações (RSVP)",
      value: stats?.totalRsvps || 0,
      icon: Users,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default EventStatsCard;
