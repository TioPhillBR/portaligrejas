import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Users, Heart, BookOpen, Music, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const schedules = [
  {
    day: "Domingo",
    icon: Users,
    services: [
      { time: "09:00", name: "Escola Bíblica Dominical" },
      { time: "18:00", name: "Culto da Família" },
    ],
  },
  {
    day: "Terça-feira",
    icon: Heart,
    services: [{ time: "19:30", name: "Culto de Oração" }],
  },
  {
    day: "Quarta-feira",
    icon: BookOpen,
    services: [{ time: "19:30", name: "Estudo Bíblico" }],
  },
  {
    day: "Quinta-feira",
    icon: Music,
    services: [{ time: "19:30", name: "Culto de Louvor" }],
  },
  {
    day: "Sexta-feira",
    icon: Users,
    services: [{ time: "19:30", name: "Culto dos Jovens" }],
  },
  {
    day: "Sábado",
    icon: Baby,
    services: [{ time: "16:00", name: "Culto Infantil" }],
  },
];

const ServiceScheduleSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="cultos" className="section-padding bg-secondary/30" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Clock className="w-4 h-4 inline mr-2" />
            Programação
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Horários de <span className="text-gold">Culto</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Venha adorar conosco! Temos programações especiais para toda a
            família durante a semana.
          </p>
        </motion.div>

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule, index) => {
            const Icon = schedule.icon;
            return (
              <motion.div
                key={schedule.day}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-gold group-hover:text-gold-foreground transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                          {schedule.day}
                        </h3>
                        <div className="space-y-2">
                          {schedule.services.map((service) => (
                            <div
                              key={service.name}
                              className="flex items-center gap-3"
                            >
                              <span className="text-lg font-bold text-gold">
                                {service.time}
                              </span>
                              <span className="text-muted-foreground">
                                {service.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceScheduleSection;
