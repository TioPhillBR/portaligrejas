import { useEffect, useState } from "react";
import { Check, Eye, Archive, Inbox, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("unread");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar mensagens", variant: "destructive" });
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao atualizar", variant: "destructive" });
    } else {
      fetchMessages();
    }
  };

  const archive = async (id: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_archived: true })
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao arquivar", variant: "destructive" });
    } else {
      toast({ title: "Mensagem arquivada" });
      fetchMessages();
    }
  };

  const filterMessages = (tab: string) => {
    switch (tab) {
      case "unread":
        return messages.filter((m) => !m.is_read && !m.is_archived);
      case "read":
        return messages.filter((m) => m.is_read && !m.is_archived);
      case "archived":
        return messages.filter((m) => m.is_archived);
      default:
        return messages;
    }
  };

  const renderMessage = (msg: ContactMessage) => (
    <Card key={msg.id} className={!msg.is_read ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10 text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium flex items-center gap-1">
                <User className="w-4 h-4" />
                {msg.name}
              </span>
              {!msg.is_read && (
                <Badge variant="secondary" className="text-xs">Novo</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
              <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-primary">
                <Mail className="w-4 h-4" />
                {msg.email}
              </a>
              {msg.phone && (
                <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-primary">
                  <Phone className="w-4 h-4" />
                  {msg.phone}
                </a>
              )}
            </div>
            <p className="text-foreground whitespace-pre-wrap">{msg.message}</p>
            <span className="text-xs text-muted-foreground mt-2 block">
              {format(new Date(msg.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!msg.is_read && (
              <Button variant="ghost" size="icon" onClick={() => markAsRead(msg.id)} title="Marcar como lido">
                <Check className="w-4 h-4" />
              </Button>
            )}
            {!msg.is_archived && (
              <Button variant="ghost" size="icon" onClick={() => archive(msg.id)} title="Arquivar">
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
          Mensagens de Contato
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as mensagens recebidas pelo formulário de contato
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unread" className="gap-2">
            <Inbox className="w-4 h-4" />
            Não Lidas ({filterMessages("unread").length})
          </TabsTrigger>
          <TabsTrigger value="read" className="gap-2">
            <Eye className="w-4 h-4" />
            Lidas ({filterMessages("read").length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="w-4 h-4" />
            Arquivadas ({filterMessages("archived").length})
          </TabsTrigger>
        </TabsList>

        {["unread", "read", "archived"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando...</div>
            ) : filterMessages(tab).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Nenhuma mensagem {tab === "unread" ? "não lida" : tab === "read" ? "lida" : "arquivada"}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterMessages(tab).map(renderMessage)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminMessages;
