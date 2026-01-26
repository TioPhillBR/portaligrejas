import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Smile, Image, Mic, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useImageUpload } from "@/hooks/useImageUpload";

interface Message {
  id: string;
  sender_id: string;
  content: string | null;
  message_type: string;
  media_url: string | null;
  is_announcement: boolean;
  created_at: string;
  sender?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface Ministry {
  id: string;
  name: string;
  color: string;
}

const christianEmojis = ["✝️", "🙏", "⛪", "📖", "🕊️", "👼", "🙌", "❤️‍🔥", "🫂", "🌟", "👑", "🔥", "💒", "🎵", "🎶"];
const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "😍", "🤗", "💪", "✨", "🙂", "😇", "💖", "🌹", "☀️", "🌈"];

const MinistryChat = () => {
  const { ministryId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadImage, uploading } = useImageUpload({ folder: "chat", bucket: "chat-media" });

  const [ministry, setMinistry] = useState<Ministry | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!ministryId) return;
    fetchMinistryAndMessages();
    subscribeToMessages();
  }, [ministryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMinistryAndMessages = async () => {
    // Fetch ministry info
    const { data: ministryData } = await supabase
      .from("ministries")
      .select("id, name, color")
      .eq("id", ministryId)
      .maybeSingle();

    if (ministryData) {
      setMinistry(ministryData);
    }

    // Fetch messages with sender info
    const { data: messagesData } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("ministry_id", ministryId)
      .order("created_at", { ascending: true });

    if (messagesData) {
      // Fetch sender profiles
      const senderIds = [...new Set(messagesData.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const messagesWithSenders = messagesData.map((msg) => ({
        ...msg,
        sender: profileMap.get(msg.sender_id) || null,
      }));

      setMessages(messagesWithSenders);
    }

    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`ministry-chat-${ministryId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `ministry_id=eq.${ministryId}`,
        },
        async (payload) => {
          const newMsg = payload.new as Message;

          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url")
            .eq("user_id", newMsg.sender_id)
            .maybeSingle();

          setMessages((prev) => [
            ...prev,
            { ...newMsg, sender: profile || null },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !ministryId) return;

    setSending(true);

    const { error } = await supabase.from("chat_messages").insert({
      ministry_id: ministryId,
      sender_id: user.id,
      content: newMessage.trim(),
      message_type: "text",
    });

    if (!error) {
      setNewMessage("");
    }

    setSending(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !ministryId) return;

    const url = await uploadImage(file);
    if (url) {
      await supabase.from("chat_messages").insert({
        ministry_id: ministryId,
        sender_id: user.id,
        message_type: "image",
        media_url: url,
      });
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const isOwnMessage = (senderId: string) => user?.id === senderId;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigate("/membro/grupos")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${ministry?.color || "from-primary to-primary"} flex items-center justify-center text-white font-bold`}>
          {ministry?.name?.charAt(0) || "?"}
        </div>
        <div className="flex-1">
          <h1 className="font-semibold">{ministry?.name}</h1>
          <p className="text-xs text-muted-foreground">Grupo do ministério</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Seja o primeiro a enviar uma mensagem! 👋</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isOwnMessage(message.sender_id) ? "flex-row-reverse" : ""}`}
              >
                {!isOwnMessage(message.sender_id) && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {message.sender?.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage(message.sender_id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } rounded-2xl ${
                    isOwnMessage(message.sender_id) ? "rounded-br-sm" : "rounded-bl-sm"
                  } px-4 py-2`}
                >
                  {!isOwnMessage(message.sender_id) && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {message.sender?.full_name || "Usuário"}
                    </p>
                  )}
                  {message.message_type === "image" && message.media_url && (
                    <img
                      src={message.media_url}
                      alt="Imagem"
                      className="rounded-lg max-w-full mb-1"
                    />
                  )}
                  {message.content && <p className="break-words">{message.content}</p>}
                  <p className={`text-xs mt-1 ${isOwnMessage(message.sender_id) ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          {/* Emoji Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="shrink-0">
                <Smile className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Cristãos</p>
                <div className="flex flex-wrap gap-1">
                  {christianEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="text-xl p-1 hover:bg-muted rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs font-medium text-muted-foreground px-1">Comuns</p>
                <div className="flex flex-wrap gap-1">
                  {commonEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="text-xl p-1 hover:bg-muted rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="chat-image-upload"
            disabled={uploading}
          />
          <label htmlFor="chat-image-upload">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 cursor-pointer"
              disabled={uploading}
              asChild
            >
              <span>
                <Image className="w-5 h-5" />
              </span>
            </Button>
          </label>

          {/* Message Input */}
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sending}
          />

          {/* Send Button */}
          <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MinistryChat;
