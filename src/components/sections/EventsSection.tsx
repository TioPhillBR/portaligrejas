import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventsSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      description?: string;
      button_text?: string;
      button_link?: string;
    };
  };
}

const EventsSection = ({ sectionData }: EventsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = sectionData?.content || {};
  const badge = content.badge || "Próximos Eventos";
  const title = sectionData?.title || "Agenda de Eventos";
  const subtitle = sectionData?.subtitle || content.description || "Participe dos nossos eventos especiais e fortaleça sua caminhada com Deus.";
  const buttonText = content.button_text || "Ver Todos os Eventos";
  const buttonLink = content.button_link || "/blog?category=eventos";

  const { data: events } = useQuery({
    queryKey: ["events-home"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="eventos" className="section-padding" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Calendar className="w-4 h-4 inline mr-2" />
            {badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, -1).join(" ")} <span className="text-gold">{title.split(" ").slice(-1)}</span>
              </>
            ) : (
              <span className="text-gold">{title}</span>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events?.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/evento/${event.id}`}>
                <Card
                  className={`group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    event.is_featured ? "border-gold/50 ring-1 ring-gold/20" : "border-border/50"
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Date Box */}
                      <div
                        className={`flex-shrink-0 p-6 flex flex-col items-center justify-center text-center ${
                          event.is_featured
                            ? "bg-gold text-gold-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <Calendar className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium opacity-90">
                          {format(new Date(event.date), "d 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                            {event.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={event.is_featured ? "bg-gold/20 text-gold" : ""}
                          >
                            {event.category || "Evento"}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground mb-4 text-sm line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {event.time && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event.time}
                            </span>
                          )}
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-10"
        >
          <Link to={buttonLink}>
            <Button variant="outline" size="lg" className="gap-2">
              {buttonText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
