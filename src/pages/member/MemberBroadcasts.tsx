import { useEffect, useState } from "react";
import { Bell, Calendar, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BroadcastMessage {
  id: string;
  title: string | null;
  content: string;
  message_type: string;
  media_url: string | null;
  target_type: string;
  created_at: string;
}

const MemberBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      const { data } = await supabase
        .from("broadcast_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setBroadcasts(data);
      }
      setLoading(false);
    };

    fetchBroadcasts();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("broadcasts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "broadcast_messages",
        },
        (payload) => {
          setBroadcasts((prev) => [payload.new as BroadcastMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTargetLabel = (targetType: string) => {
    switch (targetType) {
      case "all":
        return "Todos";
      case "ministry":
        return "Ministério";
      case "gender":
        return "Gênero";
      case "age_range":
        return "Faixa Etária";
      default:
        return targetType;
    }
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
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Avisos</h1>
        <p className="text-muted-foreground mt-1">
          Comunicados e avisos importantes da igreja
        </p>
      </div>

      {broadcasts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhum aviso no momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {broadcasts.map((broadcast) => (
            <Card key={broadcast.id} className="overflow-hidden">
              {broadcast.media_url && broadcast.message_type === "image" && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={broadcast.media_url}
                    alt={broadcast.title || "Imagem do aviso"}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {broadcast.title && (
                      <h3 className="text-lg font-semibold mb-2">{broadcast.title}</h3>
                    )}
                    <p className="text-foreground whitespace-pre-wrap">{broadcast.content}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {getTargetLabel(broadcast.target_type)}
                  </Badge>
                </div>

                {broadcast.media_url && broadcast.message_type === "audio" && (
                  <audio controls className="w-full mt-4">
                    <source src={broadcast.media_url} />
                  </audio>
                )}

                {broadcast.media_url && broadcast.message_type === "video" && (
                  <video controls className="w-full mt-4 rounded-lg max-h-96">
                    <source src={broadcast.media_url} />
                  </video>
                )}

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(broadcast.created_at), "dd 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberBroadcasts;
