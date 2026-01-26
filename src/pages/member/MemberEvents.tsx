import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Users, Check, HelpCircle, X, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isPast, isToday, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const APP_URL = typeof window !== 'undefined' ? window.location.origin : '';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  end_date: string | null;
  time: string | null;
  location: string | null;
  category: string | null;
  image_url: string | null;
}

interface EventAttendee {
  event_id: string;
  status: 'confirmed' | 'maybe' | 'declined';
}

interface AttendeeCount {
  event_id: string;
  confirmed: number;
  maybe: number;
}

const MemberEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRSVPs, setMyRSVPs] = useState<Map<string, EventAttendee>>(new Map());
  const [attendeeCounts, setAttendeeCounts] = useState<Map<string, AttendeeCount>>(new Map());
  const [loading, setLoading] = useState(true);
  const [updatingRSVP, setUpdatingRSVP] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    // Fetch active events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("is_active", true)
      .order("date", { ascending: true });

    if (eventsData) {
      setEvents(eventsData);

      // Fetch my RSVPs
      const { data: rsvpData } = await supabase
        .from("event_attendees")
        .select("event_id, status")
        .eq("user_id", user.id);

      if (rsvpData) {
        const rsvpMap = new Map(rsvpData.map(r => [r.event_id, r as EventAttendee]));
        setMyRSVPs(rsvpMap);
      }

      // Fetch attendee counts for all events
      const eventIds = eventsData.map(e => e.id);
      const { data: attendeesData } = await supabase
        .from("event_attendees")
        .select("event_id, status")
        .in("event_id", eventIds);

      if (attendeesData) {
        const counts = new Map<string, AttendeeCount>();
        attendeesData.forEach(a => {
          const current = counts.get(a.event_id) || { event_id: a.event_id, confirmed: 0, maybe: 0 };
          if (a.status === 'confirmed') current.confirmed++;
          else if (a.status === 'maybe') current.maybe++;
          counts.set(a.event_id, current);
        });
        setAttendeeCounts(counts);
      }
    }

    setLoading(false);
  };

  const handleRSVP = async (eventId: string, status: 'confirmed' | 'maybe' | 'declined') => {
    if (!user) return;
    setUpdatingRSVP(eventId);

    const existingRSVP = myRSVPs.get(eventId);

    if (existingRSVP) {
      if (status === 'declined') {
        // Remove RSVP
        const { error } = await supabase
          .from("event_attendees")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (!error) {
          const newMap = new Map(myRSVPs);
          newMap.delete(eventId);
          setMyRSVPs(newMap);
          
          // Update count
          const currentCount = attendeeCounts.get(eventId);
          if (currentCount) {
            const newCounts = new Map(attendeeCounts);
            if (existingRSVP.status === 'confirmed') currentCount.confirmed--;
            else if (existingRSVP.status === 'maybe') currentCount.maybe--;
            newCounts.set(eventId, currentCount);
            setAttendeeCounts(newCounts);
          }
          
          toast({ title: "Presença cancelada" });
        }
      } else {
        // Update RSVP
        const { error } = await supabase
          .from("event_attendees")
          .update({ status })
          .eq("event_id", eventId)
          .eq("user_id", user.id);

        if (!error) {
          const newMap = new Map(myRSVPs);
          newMap.set(eventId, { event_id: eventId, status });
          setMyRSVPs(newMap);
          
          // Update counts
          const currentCount = attendeeCounts.get(eventId) || { event_id: eventId, confirmed: 0, maybe: 0 };
          const newCounts = new Map(attendeeCounts);
          if (existingRSVP.status === 'confirmed') currentCount.confirmed--;
          else if (existingRSVP.status === 'maybe') currentCount.maybe--;
          if (status === 'confirmed') currentCount.confirmed++;
          else if (status === 'maybe') currentCount.maybe++;
          newCounts.set(eventId, currentCount);
          setAttendeeCounts(newCounts);
          
          toast({ title: status === 'confirmed' ? "Presença confirmada!" : "Marcado como talvez" });
        }
      }
    } else {
      // Create new RSVP
      const { error } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_id: user.id,
        status,
      });

      if (!error) {
        const newMap = new Map(myRSVPs);
        newMap.set(eventId, { event_id: eventId, status });
        setMyRSVPs(newMap);
        
        // Update counts
        const currentCount = attendeeCounts.get(eventId) || { event_id: eventId, confirmed: 0, maybe: 0 };
        const newCounts = new Map(attendeeCounts);
        if (status === 'confirmed') currentCount.confirmed++;
        else if (status === 'maybe') currentCount.maybe++;
        newCounts.set(eventId, currentCount);
        setAttendeeCounts(newCounts);
        
        toast({ title: status === 'confirmed' ? "Presença confirmada!" : "Marcado como talvez" });
      }
    }

    setUpdatingRSVP(null);
  };

  const getEventStatus = (event: Event) => {
    const eventDate = new Date(event.date);
    if (isPast(eventDate) && !isToday(eventDate)) return "past";
    if (isToday(eventDate)) return "today";
    return "upcoming";
  };

  const filterEvents = (status: string) => {
    return events.filter(event => {
      const eventStatus = getEventStatus(event);
      if (status === "all") return eventStatus !== "past";
      if (status === "confirmed") return myRSVPs.has(event.id) && myRSVPs.get(event.id)?.status === 'confirmed';
      if (status === "past") return eventStatus === "past";
      return eventStatus === status;
    });
  };

  const generateWhatsAppLink = (event: Event) => {
    const eventDate = format(new Date(event.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const eventLink = `${APP_URL}/membro/eventos`;
    
    let message = `🎉 *Convite para Evento*\n\n`;
    message += `📌 *${event.title}*\n\n`;
    
    if (event.description) {
      message += `${event.description}\n\n`;
    }
    
    message += `📅 *Data:* ${eventDate}\n`;
    
    if (event.time) {
      message += `⏰ *Horário:* ${event.time}\n`;
    }
    
    if (event.location) {
      message += `📍 *Local:* ${event.location}\n`;
    }
    
    message += `\n✅ Confirme sua presença pelo link:\n${eventLink}`;
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/?text=${encodedMessage}`;
  };

  const handleShareWhatsApp = (event: Event) => {
    const link = generateWhatsAppLink(event);
    window.open(link, '_blank');
    toast({ title: "Abrindo WhatsApp..." });
  };

  const EventCard = ({ event }: { event: Event }) => {
    const rsvp = myRSVPs.get(event.id);
    const counts = attendeeCounts.get(event.id);
    const eventStatus = getEventStatus(event);
    const isUpdating = updatingRSVP === event.id;

    return (
      <Card className={cn(
        "overflow-hidden transition-all",
        eventStatus === "past" && "opacity-60",
        eventStatus === "today" && "border-primary ring-2 ring-primary/20"
      )}>
        {event.image_url && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {eventStatus === "today" && (
              <Badge className="absolute top-2 right-2 bg-primary">
                Hoje!
              </Badge>
            )}
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg">{event.title}</CardTitle>
              {event.category && (
                <Badge variant="secondary" className="mt-1">{event.category}</Badge>
              )}
            </div>
            {eventStatus !== "past" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleShareWhatsApp(event)}
                className="shrink-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Compartilhar via WhatsApp"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(event.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                {event.end_date && event.end_date !== event.date && (
                  <> - {format(new Date(event.end_date), "d 'de' MMMM", { locale: ptBR })}</>
                )}
              </span>
            </div>
            {event.time && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{event.time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Attendee counts */}
          {(counts?.confirmed || counts?.maybe) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{counts.confirmed || 0} confirmados</span>
              </div>
              {counts.maybe > 0 && (
                <span>{counts.maybe} talvez</span>
              )}
            </div>
          )}

          {/* RSVP Buttons */}
          {eventStatus !== "past" && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={rsvp?.status === 'confirmed' ? "default" : "outline"}
                className="flex-1 gap-1"
                onClick={() => handleRSVP(event.id, rsvp?.status === 'confirmed' ? 'declined' : 'confirmed')}
                disabled={isUpdating}
              >
                <Check className="w-4 h-4" />
                {rsvp?.status === 'confirmed' ? "Confirmado" : "Confirmar"}
              </Button>
              <Button
                size="sm"
                variant={rsvp?.status === 'maybe' ? "secondary" : "outline"}
                className="gap-1"
                onClick={() => handleRSVP(event.id, rsvp?.status === 'maybe' ? 'declined' : 'maybe')}
                disabled={isUpdating}
              >
                <HelpCircle className="w-4 h-4" />
                Talvez
              </Button>
            </div>
          )}

          {rsvp && eventStatus !== "past" && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-destructive hover:text-destructive gap-1"
              onClick={() => handleRSVP(event.id, 'declined')}
              disabled={isUpdating}
            >
              <X className="w-4 h-4" />
              Cancelar presença
            </Button>
          )}
        </CardContent>
      </Card>
    );
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
        <h1 className="text-2xl md:text-3xl font-display font-bold">Eventos</h1>
        <p className="text-muted-foreground mt-1">
          Confira os eventos da igreja e confirme sua presença
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">Próximos</TabsTrigger>
          <TabsTrigger value="today">Hoje</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmados</TabsTrigger>
          <TabsTrigger value="past">Passados</TabsTrigger>
        </TabsList>

        {["all", "today", "confirmed", "past"].map(status => (
          <TabsContent key={status} value={status} className="mt-6">
            {filterEvents(status).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>
                  {status === "today" && "Nenhum evento hoje"}
                  {status === "confirmed" && "Você não confirmou presença em nenhum evento"}
                  {status === "past" && "Nenhum evento passado"}
                  {status === "all" && "Nenhum evento programado"}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterEvents(status).map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MemberEvents;
