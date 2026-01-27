import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Calendar, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useInAppNotifications, UnifiedNotification } from "@/hooks/useInAppNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useInAppNotifications();

  const getIcon = (notification: UnifiedNotification) => {
    if (notification.source === "message") {
      return <MessageSquare className="h-4 w-4" />;
    }
    switch (notification.type) {
      case "event":
        return <Calendar className="h-4 w-4" />;
      case "ministry":
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getLink = (notification: UnifiedNotification) => {
    if (notification.source === "message" && notification.reference_id) {
      return `/membro/mensagens/${notification.reference_id}`;
    }
    if (notification.reference_type === "event" && notification.reference_id) {
      return `/eventos/${notification.reference_id}`;
    }
    if (notification.reference_type === "ministry" && notification.reference_id) {
      return `/ministerios/${notification.reference_id}`;
    }
    return null;
  };

  const getIconStyles = (notification: UnifiedNotification) => {
    if (notification.source === "message") {
      return "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";
    }
    if (notification.type === "event") {
      return "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300";
    }
    return "bg-primary/10 text-primary";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold">Notificações</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const link = getLink(notification);
                const content = (
                  <div
                    className={cn(
                      "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative group",
                      !notification.is_read && "bg-primary/5"
                    )}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id, notification.source);
                      }
                    }}
                  >
                    <div className="flex gap-3">
                      {notification.source === "message" && notification.sender_profile ? (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={notification.sender_profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                            <MessageSquare className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                            getIconStyles(notification)
                          )}
                        >
                          {getIcon(notification)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id, notification.source);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      {notification.source === "notification" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id, notification.source);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );

                return link ? (
                  <Link
                    key={`${notification.source}-${notification.id}`}
                    to={link}
                    onClick={() => setOpen(false)}
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={`${notification.source}-${notification.id}`}>{content}</div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
