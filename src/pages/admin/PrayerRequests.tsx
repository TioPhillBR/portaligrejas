import { useEffect, useState } from "react";
import { Check, Eye, Archive, Inbox, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrayerRequest {
  id: string;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

const AdminPrayerRequests = () => {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar pedidos", variant: "destructive" });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("prayer_requests")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      fetchRequests();
    }
  };

  const archive = async (id: string) => {
    const { error } = await supabase
      .from("prayer_requests")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao arquivar", variant: "destructive" });
    } else {
      toast({ title: "Pedido arquivado" });
      fetchRequests();
    }
  };

  const filterRequests = (tab: string) => {
    switch (tab) {
      case "unread":
        return requests.filter((r) => !r.is_read && !r.is_archived);
      case "read":
        return requests.filter((r) => r.is_read && !r.is_archived);
      case "archived":
        return requests.filter((r) => r.is_archived);
      default:
        return requests;
    }
  };

  const renderRequest = (request: PrayerRequest) => (
    <Card key={request.id} className={!request.is_read ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Heart className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">
                {format(new Date(request.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </span>
              {!request.is_read && (
                <Badge variant="secondary" className="text-xs">Novo</Badge>
              )}
            </div>
            <p className="text-foreground whitespace-pre-wrap">{request.message}</p>
          </div>
          <div className="flex items-center gap-1">
            {!request.is_read && (
              <Button variant="ghost" size="icon" onClick={() => markAsRead(request.id)} title="Marcar como lido">
                <Check className="w-4 h-4" />
              </Button>
            )}
            {!request.is_archived && (
              <Button variant="ghost" size="icon" onClick={() => archive(request.id)} title="Arquivar">
                <Archive className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Pedidos de Oração
        </h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe os pedidos de oração enviados pelos visitantes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unread" className="gap-2">
            <Inbox className="w-4 h-4" />
            Não Lidos ({filterRequests("unread").length})
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2">
            <Eye className="w-4 h-4" />
            Lidos ({filterRequests("read").length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="w-4 h-4" />
            Arquivados ({filterRequests("archived").length})
          </TabsTrigger>
        </TabsList>

        {["unread", "read", "archived"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : filterRequests(tab).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhum pedido {tab === "unread" ? "não lido" : tab === "read" ? "lido" : "arquivado"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterRequests(tab).map(renderRequest)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminPrayerRequests;
