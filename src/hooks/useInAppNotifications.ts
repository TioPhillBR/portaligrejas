import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface InAppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface UnifiedNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
  source: "notification" | "message";
  sender_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useInAppNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["in-app-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("in_app_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as InAppNotification[];
    },
    enabled: !!user,
  });

  // Fetch unread direct messages
  const { data: directMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["direct-messages-notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("direct_messages")
        .select("*")
        .eq("recipient_id", user?.id)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch sender profiles
      const senderIds = [...new Set(data.map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", senderIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((msg) => ({
        ...msg,
        sender_profile: profileMap.get(msg.sender_id) || null,
      })) as DirectMessage[];
    },
    enabled: !!user,
  });

  // Real-time subscription for direct messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("unified-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["direct-messages-notifications"] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "in_app_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Combine notifications and messages into unified list
  const unifiedNotifications: UnifiedNotification[] = [
    ...notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      reference_type: n.reference_type,
      reference_id: n.reference_id,
      is_read: n.is_read,
      created_at: n.created_at,
      source: "notification" as const,
    })),
    ...directMessages.map((m) => ({
      id: m.id,
      title: m.sender_profile?.full_name || "Nova mensagem",
      message: m.content || "Mídia recebida",
      type: "message",
      reference_type: "direct_message",
      reference_id: m.sender_id,
      is_read: m.is_read,
      created_at: m.created_at,
      source: "message" as const,
      sender_profile: m.sender_profile,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const unreadCount =
    notifications.filter((n) => !n.is_read).length +
    directMessages.filter((m) => !m.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async ({ id, source }: { id: string; source: "notification" | "message" }) => {
      if (source === "notification") {
        const { error } = await supabase
          .from("in_app_notifications")
          .update({ is_read: true })
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["direct-messages-notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      // Mark all notifications as read
      const { error: notifError } = await supabase
        .from("in_app_notifications")
        .update({ is_read: true })
        .eq("is_read", false);

      if (notifError) throw notifError;

      // Mark all messages as read
      if (user) {
        const { error: msgError } = await supabase
          .from("direct_messages")
          .update({ is_read: true })
          .eq("recipient_id", user.id)
          .eq("is_read", false);

        if (msgError) throw msgError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["direct-messages-notifications"] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async ({ id, source }: { id: string; source: "notification" | "message" }) => {
      if (source === "notification") {
        const { error } = await supabase
          .from("in_app_notifications")
          .delete()
          .eq("id", id);
        if (error) throw error;
      }
      // Messages cannot be deleted by recipient, just mark as read
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["in-app-notifications"] });
    },
  });

  return {
    notifications: unifiedNotifications,
    unreadCount,
    isLoading: notificationsLoading || messagesLoading,
    markAsRead: (id: string, source: "notification" | "message") =>
      markAsRead.mutate({ id, source }),
    markAllAsRead: markAllAsRead.mutate,
    deleteNotification: (id: string, source: "notification" | "message") =>
      deleteNotification.mutate({ id, source }),
  };
}
