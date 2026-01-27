import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Music, Heart, Baby, BookOpen, Hand, Mic, Star, Church, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MinistriesSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
    };
  };
}

const MinistriesSection = ({ sectionData }: MinistriesSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const content = sectionData?.content || {};
  const badge = content.badge || "Servindo ao Senhor";
  const title = sectionData?.title || "Nossos Ministérios";
  const subtitle = sectionData?.subtitle || "Cada ministério é uma oportunidade de servir a Deus e fazer a diferença na vida das pessoas.";

  const { data: ministries } = useQuery({
    queryKey: ["ministries-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    Music,
    Heart,
    Baby,
    BookOpen,
    Hand,
    Mic,
    Star,
    Church,
    Globe,
  };

  const getIcon = (iconName: string) => {
    return iconMap[iconName] || Users;
  };

  return (
    <section id="ministerios" className="section-padding bg-secondary/30" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Users className="w-4 h-4 inline mr-2" />
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

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries?.map((ministry, index) => {
            const Icon = getIcon(ministry.icon || "Users");
            return (
              <motion.div
                key={ministry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/ministerio/${ministry.id}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 bg-card overflow-hidden cursor-pointer">
                    <CardContent className="p-0">
                      {/* Gradient Header */}
                      <div className={`h-24 bg-gradient-to-r ${ministry.color || "from-blue-500 to-blue-600"} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-black/10" />
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Icon className="w-12 h-12 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                          {ministry.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                          {ministry.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
