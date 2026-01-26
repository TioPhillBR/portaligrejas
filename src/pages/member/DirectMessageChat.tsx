import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Smile, Image } from "lucide-react";
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
  recipient_id: string;
  content: string | null;
  message_type: string;
  media_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const christianEmojis = ["✝️", "🙏", "⛪", "📖", "🕊️", "👼", "🙌", "❤️‍🔥", "🫂", "🌟", "👑", "🔥", "💒", "🎵", "🎶"];
const commonEmojis = ["😊", "😂", "❤️", "👍", "🎉", "😍", "🤗", "💪", "✨", "🙂", "😇", "💖", "🌹", "☀️", "🌈"];

const DirectMessageChat = () => {
  const { recipientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { uploadImage, uploading } = useImageUpload({ folder: "chat", bucket: "chat-media" });

  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!recipientId || !user) return;
    fetchRecipientAndMessages();
    subscribeToMessages();
    markMessagesAsRead();
  }, [recipientId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRecipientAndMessages = async () => {
    // Fetch recipient profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .eq("user_id", recipientId)
      .maybeSingle();

    if (profileData) {
      setRecipient(profileData);
    }

    // Fetch messages between user and recipient
    const { data: messagesData } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user?.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user?.id})`
      )
      .order("created_at", { ascending: true });

    if (messagesData) {
      setMessages(messagesData);
    }

    setLoading(false);
  };

  const markMessagesAsRead = async () => {
    if (!user || !recipientId) return;

    await supabase
      .from("direct_messages")
      .update({ is_read: true })
      .eq("sender_id", recipientId)
      .eq("recipient_id", user.id)
      .eq("is_read", false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`dm-${user?.id}-${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if it's part of this conversation
          if (
            (newMsg.sender_id === user?.id && newMsg.recipient_id === recipientId) ||
            (newMsg.sender_id === recipientId && newMsg.recipient_id === user?.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            // Mark as read if we're the recipient
            if (newMsg.recipient_id === user?.id) {
              supabase
                .from("direct_messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !recipientId) return;

    setSending(true);

    const { error } = await supabase.from("direct_messages").insert({
      sender_id: user.id,
      recipient_id: recipientId,
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
    if (!file || !user || !recipientId) return;

    const url = await uploadImage(file);
    if (url) {
      await supabase.from("direct_messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
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
        <Button variant="ghost" size="icon" onClick={() => navigate("/membro/mensagens")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10">
          <AvatarImage src={recipient?.avatar_url || undefined} />
          <AvatarFallback>
            {recipient?.full_name?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-semibold">{recipient?.full_name || "Usuário"}</h1>
          <p className="text-xs text-muted-foreground">Mensagem direta</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma mensagem ainda.</p>
              <p className="text-sm">Envie uma mensagem para iniciar a conversa! 👋</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isOwnMessage(message.sender_id) ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage(message.sender_id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } rounded-2xl ${
                    isOwnMessage(message.sender_id) ? "rounded-br-sm" : "rounded-bl-sm"
                  } px-4 py-2`}
                >
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
            id="dm-image-upload"
            disabled={uploading}
          />
          <label htmlFor="dm-image-upload">
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

export default DirectMessageChat;
