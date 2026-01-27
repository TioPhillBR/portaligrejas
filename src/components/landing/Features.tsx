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
    description: "Crie e gerencie eventos com confirmação de presença online. Seus membros ficam informados automaticamente.",
  },
  {
    icon: Users,
    title: "Ministérios e Grupos",
    description: "Organize seus ministérios com líderes, membros e comunicação dedicada para cada grupo.",
  },
  {
    icon: FileText,
    title: "Blog Integrado",
    description: "Publique reflexões, estudos bíblicos e novidades com editor visual profissional.",
  },
  {
    icon: Image,
    title: "Galeria de Fotos",
    description: "Compartilhe momentos especiais da comunidade com uma galeria de fotos organizada.",
  },
  {
    icon: Bell,
    title: "Notificações",
    description: "Mantenha sua comunidade informada com notificações push e avisos importantes.",
  },
  {
    icon: Palette,
    title: "Personalização",
    description: "Customize cores, logo e aparência para refletir a identidade visual da sua igreja.",
  },
  {
    icon: Shield,
    title: "Área do Membro",
    description: "Espaço exclusivo para membros com acesso a conteúdos, grupos e comunicação.",
  },
  {
    icon: Smartphone,
    title: "100% Responsivo",
    description: "Seu site funciona perfeitamente em qualquer dispositivo: celular, tablet ou computador.",
  },
  {
    icon: MessageSquare,
    title: "Chat de Ministérios",
    description: "Comunicação em tempo real entre membros de cada ministério.",
  },
  {
    icon: Heart,
    title: "Pedidos de Oração",
    description: "Receba e gerencie pedidos de oração da comunidade de forma organizada.",
  },
  {
    icon: Radio,
    title: "Web Rádio",
    description: "Integre sua web rádio ou streaming de áudio diretamente no site.",
  },
  {
    icon: Settings,
    title: "Painel Administrativo",
    description: "Gerencie tudo em um painel intuitivo com controle total do conteúdo.",
  },
];

export const Features = () => {
  return (
    <section id="recursos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tudo que sua igreja precisa
          </h2>
          <p className="text-lg text-muted-foreground">
            Recursos completos para gerenciar sua comunidade e manter todos conectados.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
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
