import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Users, Music, Heart, Baby, BookOpen, Hand } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ministries = [
  {
    id: 1,
    name: "Ministério de Louvor",
    icon: Music,
    description: "Levando adoração ao coração de Deus através da música e do louvor congregacional.",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    name: "Ministério de Jovens",
    icon: Users,
    description: "Conectando a nova geração com o propósito de Deus para suas vidas.",
    color: "from-purple-500 to-purple-600",
  },
  {
    id: 3,
    name: "Ministério de Mulheres",
    icon: Heart,
    description: "Fortalecendo mulheres para serem instrumentos de Deus em suas famílias e comunidades.",
    color: "from-pink-500 to-pink-600",
  },
  {
    id: 4,
    name: "Ministério Infantil",
    icon: Baby,
    description: "Ensinando as crianças a conhecerem e amarem a Deus desde cedo.",
    color: "from-orange-500 to-orange-600",
  },
  {
    id: 5,
    name: "Ministério de Ensino",
    icon: BookOpen,
    description: "Discipulando através do estudo aprofundado da Palavra de Deus.",
    color: "from-green-500 to-green-600",
  },
  {
    id: 6,
    name: "Ministério de Ação Social",
    icon: Hand,
    description: "Levando o amor de Cristo às pessoas em situação de vulnerabilidade.",
    color: "from-red-500 to-red-600",
  },
];

const MinistriesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            Servindo ao Senhor
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Nossos <span className="text-gold">Ministérios</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada ministério é uma oportunidade de servir a Deus e fazer a
            diferença na vida das pessoas.
          </p>
        </motion.div>

        {/* Ministries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map((ministry, index) => {
            const Icon = ministry.icon;
            return (
              <motion.div
                key={ministry.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-border/50 bg-card overflow-hidden cursor-pointer">
                  <CardContent className="p-0">
                    {/* Gradient Header */}
                    <div className={`h-24 bg-gradient-to-r ${ministry.color} relative overflow-hidden`}>
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
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {ministry.description}
                      </p>
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

export default MinistriesSection;
