import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const events = [
  {
    id: 1,
    title: "Conferência de Mulheres",
    date: "15 de Fevereiro, 2025",
    time: "19:00",
    location: "Templo Principal",
    description: "Um encontro especial para fortalecer a fé e a comunhão entre as mulheres da nossa igreja.",
    category: "Conferência",
    featured: true,
  },
  {
    id: 2,
    title: "Retiro de Jovens",
    date: "22-24 de Março, 2025",
    time: "Dia inteiro",
    location: "Chácara Vida Nova",
    description: "Três dias de comunhão, louvor e ensinamentos para os jovens.",
    category: "Retiro",
    featured: false,
  },
  {
    id: 3,
    title: "Batismo nas Águas",
    date: "30 de Março, 2025",
    time: "10:00",
    location: "Templo Principal",
    description: "Celebração de vidas transformadas através do batismo.",
    category: "Celebração",
    featured: false,
  },
  {
    id: 4,
    title: "Escola de Líderes",
    date: "Todo Sábado",
    time: "09:00",
    location: "Sala de Estudos",
    description: "Formação de líderes para servir melhor no Reino de Deus.",
    category: "Formação",
    featured: false,
  },
];

const EventsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Próximos Eventos
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Agenda de <span className="text-gold">Eventos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Participe dos nossos eventos especiais e fortaleça sua caminhada com
            Deus.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                  event.featured ? "border-gold/50 ring-1 ring-gold/20" : "border-border/50"
                }`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Date Box */}
                    <div
                      className={`flex-shrink-0 p-6 flex flex-col items-center justify-center text-center ${
                        event.featured
                          ? "bg-gold text-gold-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      <Calendar className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium opacity-90">
                        {event.date.split(",")[0]}
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
                          className={event.featured ? "bg-gold/20 text-gold" : ""}
                        >
                          {event.category}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground mb-4 text-sm">
                        {event.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {event.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
          <Button variant="outline" size="lg" className="gap-2">
            Ver Todos os Eventos
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
