import {
  Calendar,
  Users,
  FileText,
  Image,
  Bell,
  Palette,
  Shield,
  Smartphone,
  MessageSquare,
  Heart,
  Radio,
  Settings,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Gestão de Eventos",
    description: "Eventos com confirmação online. Seus membros confirmam presença com um clique.",
  },
  {
    icon: Users,
    title: "Ministérios e Grupos",
    description: "Organize seus ministérios com líderes, membros e comunicação dedicada.",
  },
  {
    icon: FileText,
    title: "Blog Integrado",
    description: "Publique reflexões e estudos bíblicos com editor visual profissional.",
  },
  {
    icon: Image,
    title: "Galeria de Fotos",
    description: "Compartilhe momentos especiais da comunidade de forma organizada.",
  },
  {
    icon: Bell,
    title: "Notificações para Membros",
    description: "Mantenha sua comunidade informada com notificações push e avisos.",
  },
  {
    icon: Palette,
    title: "Personalização Visual",
    description: "Customize cores, logo e aparência para refletir sua identidade.",
  },
  {
    icon: Shield,
    title: "Área do Membro",
    description: "Espaço exclusivo para membros com acesso a conteúdos e grupos.",
  },
  {
    icon: Smartphone,
    title: "Site 100% Responsivo",
    description: "Funciona perfeitamente em celular, tablet ou computador.",
  },
  {
    icon: MessageSquare,
    title: "Chat de Ministérios",
    description: "Comunicação em tempo real entre membros de cada ministério.",
  },
  {
    icon: Heart,
    title: "Pedidos de Oração",
    description: "Receba e gerencie pedidos de oração de forma organizada.",
  },
  {
    icon: Radio,
    title: "Web Rádio",
    description: "Integre sua web rádio ou streaming de áudio diretamente no site.",
  },
  {
    icon: Settings,
    title: "Painel Administrativo",
    description: "Gerencie tudo em um painel intuitivo com controle total.",
  },
];

export const Features = () => {
  return (
    <section id="recursos" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tudo que sua igreja precisa
          </h2>
          <p className="text-lg text-muted-foreground">
            Recursos completos para gerenciar sua comunidade e manter todos conectados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
