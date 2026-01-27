import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Church, Target, Eye, Heart, History, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface AboutTab {
  id: string;
  label: string;
  icon: string;
  title: string;
  content?: string;
  values?: string[];
}

interface AboutSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      tabs?: AboutTab[];
    };
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Church,
  Target,
  Eye,
  Heart,
  History,
};

const defaultTabs: AboutTab[] = [
  {
    id: "historia",
    label: "Nossa História",
    icon: "History",
    title: "Nossa História",
    content: "Fundada em 1985, nossa igreja nasceu do sonho de um pequeno grupo de fiéis que se reunia em uma casa no centro da cidade. Ao longo dos anos, crescemos em fé e números, sempre mantendo nosso compromisso com o evangelho.",
  },
  {
    id: "missao",
    label: "Missão",
    icon: "Target",
    title: "Nossa Missão",
    content: "Pregar o evangelho e fazer discípulos de todas as nações, ensinando-os a guardar todas as coisas que Jesus nos ordenou.",
  },
  {
    id: "visao",
    label: "Visão",
    icon: "Eye",
    title: "Nossa Visão",
    content: "Ser uma igreja que transforma vidas através do amor de Cristo, impactando positivamente nossa comunidade e o mundo.",
  },
  {
    id: "valores",
    label: "Valores",
    icon: "Heart",
    title: "Nossos Valores",
    values: ["Fé em Deus", "Amor ao próximo", "Comunhão fraterna", "Excelência no serviço", "Integridade"],
  },
];

const AboutSection = ({ sectionData }: AboutSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("historia");

  const content = sectionData?.content || {};
  const badge = content.badge || "Quem Somos";
  const title = sectionData?.title || "Sobre Nós";
  const subtitle = sectionData?.subtitle || "Conheça nossa história, missão, visão e os valores que nos guiam em nossa caminhada com Deus.";
  
  // Use tabs from database or fallback to defaults
  const tabs = content.tabs && content.tabs.length > 0 ? content.tabs : defaultTabs;

  return (
    <section id="quem-somos" className="section-padding" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Church className="w-4 h-4 inline mr-2" />
            {badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {title.includes(" ") ? (
              <>
                {title.split(" ")[0]} <span className="text-gold">{title.split(" ").slice(1).join(" ")}</span>
              </>
            ) : (
              <span className="text-gold">{title}</span>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex flex-wrap justify-center gap-2 bg-transparent h-auto mb-8">
              {tabs.map((tab) => {
                const Icon = iconMap[tab.icon] || Church;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-6 py-3 rounded-lg transition-all"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id}>
                <Card className="border-border/50">
                  <CardContent className="p-8 md:p-12">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">
                      {tab.title}
                    </h3>

                    {tab.content && (
                      <div className="prose prose-lg max-w-none text-muted-foreground">
                        {tab.content.split("\n\n").map((paragraph, idx) => (
                          <p key={idx} className="mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}

                    {tab.values && tab.values.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tab.values.map((value, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-5 h-5 text-gold" />
                              <h4 className="font-semibold text-foreground">
                                {value}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
