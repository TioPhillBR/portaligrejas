import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, Users, Heart, BookOpen, Music, Baby } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceScheduleSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
    };
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Heart,
  BookOpen,
  Music,
  Baby,
  Clock,
};

const ServiceScheduleSection = ({ sectionData }: ServiceScheduleSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = sectionData?.content || {};
  const badge = content.badge || "Programação";
  const title = sectionData?.title || "Horários de Culto";
  const subtitle = sectionData?.subtitle || "Venha adorar conosco! Temos programações especiais para toda a família durante a semana.";

  const { data: schedules } = useQuery({
    queryKey: ["service-schedules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_schedules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Group schedules by day
  const schedulesByDay = schedules?.reduce((acc, schedule) => {
    if (!acc[schedule.day_of_week]) {
      acc[schedule.day_of_week] = {
        day: schedule.day_of_week,
        icon: schedule.icon || "Users",
        services: [],
      };
    }
    acc[schedule.day_of_week].services.push({
      time: schedule.time,
      name: schedule.name,
    });
    return acc;
  }, {} as Record<string, { day: string; icon: string; services: { time: string; name: string }[] }>);

  const groupedSchedules = schedulesByDay ? Object.values(schedulesByDay) : [];

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

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedSchedules.map((schedule, index) => {
            const Icon = iconMap[schedule.icon] || Users;
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
