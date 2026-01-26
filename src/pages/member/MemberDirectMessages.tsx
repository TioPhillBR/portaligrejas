import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Send, MessageCircle, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Conversation {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  isRead: boolean;
}

const MemberDirectMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      // Get all direct messages where user is sender or recipient
      const { data: messages } = await supabase
        .from("direct_messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!messages) {
        setLoading(false);
        return;
      }

      // Group by conversation partner
      const conversationMap = new Map<string, any>();

      for (const msg of messages) {
        const partnerId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
        
        if (!conversationMap.has(partnerId)) {
          conversationMap.set(partnerId, {
            partnerId,
            lastMessage: msg.content,
            lastMessageTime: msg.created_at,
            isRead: msg.sender_id === user.id || msg.is_read,
          });
        }
      }

      // Fetch partner profiles
      const partnerIds = Array.from(conversationMap.keys());
      if (partnerIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", partnerIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const conversationList: Conversation[] = [];
      conversationMap.forEach((conv, partnerId) => {
        const profile = profileMap.get(partnerId);
        conversationList.push({
          id: partnerId,
          recipientId: partnerId,
          recipientName: profile?.full_name || "Usuário",
          recipientAvatar: profile?.avatar_url || null,
          lastMessage: conv.lastMessage || "",
          lastMessageTime: conv.lastMessageTime,
          isRead: conv.isRead,
        });
      });

      // Sort by last message time
      conversationList.sort(
        (a, b) =>
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
      );

      setConversations(conversationList);
      setLoading(false);
    };

    fetchConversations();
  }, [user]);

  const filteredConversations = conversations.filter((conv) =>
    conv.recipientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="text-3xl font-display font-bold text-foreground">Mensagens</h1>
        <p className="text-muted-foreground mt-1">
          Suas conversas privadas com outros membros
        </p>
      </div>

      <Input
        placeholder="Buscar conversas..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />

      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "Nenhuma conversa encontrada"
                : "Você ainda não tem conversas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Link key={conversation.id} to={`/membro/mensagens/${conversation.recipientId}`}>
              <Card className={`hover:bg-muted/50 transition-colors cursor-pointer ${!conversation.isRead ? "border-primary/50 bg-primary/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.recipientAvatar || undefined} />
                      <AvatarFallback>
                        {conversation.recipientName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${!conversation.isRead ? "font-semibold" : ""}`}>
                          {conversation.recipientName}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(conversation.lastMessageTime), "dd/MM", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${!conversation.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberDirectMessages;
