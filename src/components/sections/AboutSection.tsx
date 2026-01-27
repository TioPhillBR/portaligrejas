import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Church, Target, Eye, Gem, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface AboutSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      tabs?: Array<{
        id: string;
        label: string;
        icon: string;
        title: string;
        text?: string;
        values?: Array<{ title: string; description: string }>;
      }>;
    };
  };
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Church,
  Target,
  Eye,
  Gem,
};

const defaultTabs = [
  {
    id: "historia",
    label: "Nossa História",
    icon: "Church",
    title: "Uma caminhada de fé",
    text: `A Igreja Luz do Evangelho nasceu em 1985, quando um pequeno grupo de 12 famílias se reuniu pela primeira vez em uma garagem no centro da cidade. Com um sonho de compartilhar o amor de Cristo, esses pioneiros da fé começaram uma jornada que transformaria milhares de vidas.

Ao longo de quase 40 anos, crescemos de um pequeno grupo para uma comunidade vibrante de mais de 2.000 membros. Construímos nosso templo em 1995, expandimos para três congregações e mantemos projetos missionários em 5 países.

Nossa história é escrita com fé, perseverança e muitos milagres. Cada geração que passa por aqui deixa sua marca e contribui para o legado de amor e serviço ao próximo.`,
  },
  {
    id: "missao",
    label: "Missão",
    icon: "Target",
    title: "Nosso propósito",
    text: `Nossa missão é levar a mensagem transformadora do Evangelho a todas as pessoas, fazendo discípulos de Jesus Cristo e edificando uma comunidade de fé que impacte positivamente a sociedade.

Acreditamos que cada pessoa foi criada com um propósito único e que, através do relacionamento com Deus, pode descobrir e viver esse propósito plenamente.

Trabalhamos incansavelmente para ser uma igreja relevante, acolhedora e comprometida com a Palavra de Deus, onde todos possam encontrar esperança, cura e direção para suas vidas.`,
  },
  {
    id: "visao",
    label: "Visão",
    icon: "Eye",
    title: "Onde queremos chegar",
    text: `Nossa visão é ser uma igreja que transforma vidas e comunidades através do poder do Evangelho, alcançando todas as gerações com a mensagem de salvação em Cristo Jesus.

Sonhamos com uma igreja onde cada membro é um discípulo ativo, engajado em sua fé e comprometido com o serviço ao próximo. Uma comunidade que não conhece barreiras sociais, culturais ou geracionais.

Até 2030, almejamos plantar 10 novas congregações, formar 500 novos líderes e impactar 50.000 pessoas através de nossos projetos sociais e missionários.`,
  },
  {
    id: "valores",
    label: "Valores",
    icon: "Gem",
    title: "O que nos guia",
    values: [
      { title: "Fé", description: "Cremos no poder transformador de Deus em todas as circunstâncias." },
      { title: "Amor", description: "Amamos a Deus sobre todas as coisas e ao próximo como a nós mesmos." },
      { title: "Família", description: "Valorizamos a família como base da sociedade e da igreja." },
      { title: "Integridade", description: "Vivemos de acordo com os princípios bíblicos em todas as áreas." },
      { title: "Serviço", description: "Servimos uns aos outros e à comunidade com alegria e excelência." },
      { title: "Excelência", description: "Buscamos dar o nosso melhor em tudo que fazemos para a glória de Deus." },
    ],
  },
];

const AboutSection = ({ sectionData }: AboutSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTab, setActiveTab] = useState("historia");

  const content = sectionData?.content || {};
  const badge = content.badge || "Conheça-nos";
  const title = sectionData?.title || "Quem Somos";
  const subtitle = sectionData?.subtitle || "Conheça nossa história, missão, visão e os valores que nos guiam em nossa caminhada com Deus.";
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

                    {tab.text && (
                      <div className="prose prose-lg max-w-none text-muted-foreground">
                        {tab.text.split("\n\n").map((paragraph, idx) => (
                          <p key={idx} className="mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}

                    {tab.values && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tab.values.map((value, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <ChevronRight className="w-5 h-5 text-gold" />
                              <h4 className="font-semibold text-foreground">
                                {value.title}
                              </h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {value.description}
                            </p>
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
