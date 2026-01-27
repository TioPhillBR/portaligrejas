import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Clock, ArrowLeft, Share2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileFooter from "@/components/MobileFooter";
import PhotoGallery from "@/components/PhotoGallery";
import RSVPButton from "@/components/RSVPButton";
import Breadcrumb from "@/components/Breadcrumb";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import PageTransition from "@/components/PageTransition";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      // Increment view count
      if (data) {
        supabase.rpc("increment_event_views", { event_id: id }).then();
      }
      
      return data;
    },
    enabled: !!id,
  });

  const { data: attendees } = useQuery({
    queryKey: ["event-attendees", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_attendees")
        .select("*, profiles(full_name, avatar_url)")
        .eq("event_id", id!)
        .eq("status", "confirmed");

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: event.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container-custom">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Evento não encontrado</h1>
            <Link to="/#eventos">
              <Button>Voltar para Eventos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const eventDate = new Date(event.date);

  return (
    <PageTransition>
      <Header />
      <main className="min-h-screen pt-24 pb-24 md:pb-16">
        <div className="container-custom">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: "Eventos", href: "/#eventos" },
              { label: event.title }
            ]} 
          />

          {/* Hero Image */}
          {event.image_url && (
            <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {event.is_featured && (
                <Badge className="absolute top-4 left-4 bg-primary">
                  Destaque
                </Badge>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {event.category && (
                <Badge variant="outline" className="mb-4">
                  {event.category}
                </Badge>
              )}

              <h1 className="text-3xl md:text-4xl font-bold mb-6">
                {event.title}
              </h1>

              {event.description && (
                <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Photo Gallery */}
              <PhotoGallery entityType="event" entityId={event.id} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Event Info Card */}
              <div className="bg-card rounded-xl p-6 shadow-lg border">
                <h3 className="font-semibold mb-4">Informações do Evento</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {format(eventDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(eventDate, "yyyy")}
                      </p>
                    </div>
                  </div>

                  {event.time && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <p>{event.time}</p>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5" />
                      <p>{event.location}</p>
                    </div>
                  )}
                </div>

                {/* RSVP Button */}
                <div className="mt-6 pt-6 border-t">
                  <RSVPButton eventId={event.id} />
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button onClick={handleShare} variant="outline" className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar Evento
                  </Button>
                </div>
              </div>

              {/* Attendees Card */}
              {attendees && attendees.length > 0 && (
                <div className="bg-card rounded-xl p-6 shadow-lg border">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">
                      {attendees.length} Confirmado{attendees.length !== 1 && "s"}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {attendees.slice(0, 10).map((attendee: any) => (
                      <div
                        key={attendee.id}
                        className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium"
                        title={attendee.profiles?.full_name || "Membro"}
                      >
                        {attendee.profiles?.avatar_url ? (
                          <img
                            src={attendee.profiles.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (attendee.profiles?.full_name?.[0] || "?").toUpperCase()
                        )}
                      </div>
                    ))}
                    {attendees.length > 10 && (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                        +{attendees.length - 10}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileFooter />
      <ScrollToTopButton />
    </PageTransition>
  );
};

export default EventDetails;
