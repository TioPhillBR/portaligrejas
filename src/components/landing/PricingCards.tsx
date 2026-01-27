import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar",
    features: [
      "1 site de igreja",
      "Até 100 membros",
      "Gestão de eventos básica",
      "Blog com 10 posts/mês",
      "Galeria com 50 fotos",
      "Suporte por email",
    ],
    limitations: [
      "Com marca d'água Portal Igrejas",
      "Domínio compartilhado",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para igrejas em crescimento",
    features: [
      "1 site de igreja",
      "Membros ilimitados",
      "Eventos ilimitados",
      "Blog ilimitado",
      "Galeria ilimitada",
      "Área do membro completa",
      "Chat de ministérios",
      "Notificações push",
      "Relatórios e estatísticas",
      "Suporte prioritário",
    ],
    limitations: [],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    name: "Igreja+",
    price: "R$ 99",
    period: "/mês",
    description: "Recursos avançados",
    features: [
      "Tudo do Pro",
      "Domínio personalizado",
      "Remoção da marca",
      "Integração com transmissões",
      "Web rádio integrada",
      "API para integrações",
      "Backup diário",
      "Múltiplos administradores",
      "Suporte por WhatsApp",
      "Treinamento personalizado",
    ],
    limitations: [],
    cta: "Assinar Igreja+",
    highlighted: false,
  },
];

export const PricingCards = () => {
  return (
    <section id="precos" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-lg text-muted-foreground">
            Comece gratuitamente e evolua conforme sua igreja cresce.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-card border rounded-2xl p-8 flex flex-col",
                plan.highlighted
                  ? "border-primary shadow-xl scale-105 z-10"
                  : "border-border"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, i) => (
                  <li key={`lim-${i}`} className="flex items-start gap-2 opacity-60">
                    <span className="w-5 h-5 shrink-0 text-center text-muted-foreground">•</span>
                    <span className="text-muted-foreground text-sm">{limitation}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.highlighted ? "default" : "outline"}
                className="w-full"
                size="lg"
              >
                <Link to="/criar-igreja">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Todos os planos incluem SSL gratuito, atualizações automáticas e suporte técnico.
        </p>
      </div>
    </section>
  );
};
