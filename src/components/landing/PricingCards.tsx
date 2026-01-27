import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Prata",
    badge: "🥈",
    price: "R$ 69",
    period: "/mês",
    description: "Ideal para igrejas que estão começando sua presença digital.",
    features: [
      { name: "Site 100% Responsivo", included: true },
      { name: "Painel Administrativo", included: true },
      { name: "Personalização Visual", included: true },
      { name: "Galeria de Fotos", included: true },
      { name: "Gestão de Eventos", included: true },
      { name: "Pedidos de Oração", included: true },
      { name: "Blog Integrado", included: false },
      { name: "Ministérios e Grupos", included: false },
      { name: "Área do Membro", included: false },
      { name: "Notificações Push", included: false },
      { name: "Chat de Ministérios", included: false },
      { name: "Web Rádio / Streaming", included: false },
    ],
    cta: "Quero o Plano Prata",
    highlighted: false,
  },
  {
    name: "Ouro",
    badge: "🥇",
    price: "R$ 119",
    period: "/mês",
    description: "Para igrejas que desejam mais engajamento e organização.",
    features: [
      { name: "Site 100% Responsivo", included: true },
      { name: "Painel Administrativo", included: true },
      { name: "Personalização Visual", included: true },
      { name: "Galeria de Fotos", included: true },
      { name: "Gestão de Eventos", included: true },
      { name: "Pedidos de Oração", included: true },
      { name: "Blog Integrado", included: true },
      { name: "Ministérios e Grupos", included: true },
      { name: "Área do Membro", included: true },
      { name: "Notificações Push", included: true },
      { name: "Chat de Ministérios", included: false },
      { name: "Web Rádio / Streaming", included: false },
    ],
    cta: "Quero o Plano Ouro",
    highlighted: true,
  },
  {
    name: "Diamante",
    badge: "💎",
    price: "R$ 189",
    period: "/mês",
    description: "A solução mais completa para igrejas conectadas e em crescimento.",
    features: [
      { name: "Site 100% Responsivo", included: true },
      { name: "Painel Administrativo", included: true },
      { name: "Personalização Visual", included: true },
      { name: "Galeria de Fotos", included: true },
      { name: "Gestão de Eventos", included: true },
      { name: "Pedidos de Oração", included: true },
      { name: "Blog Integrado", included: true },
      { name: "Ministérios e Grupos", included: true },
      { name: "Área do Membro", included: true },
      { name: "Notificações Push", included: true },
      { name: "Chat de Ministérios", included: true },
      { name: "Web Rádio / Streaming", included: true },
    ],
    extras: ["Suporte prioritário"],
    cta: "Quero o Plano Diamante",
    highlighted: false,
  },
];

export const PricingCards = () => {
  return (
    <section id="precos" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Planos acessíveis para igrejas de todos os tamanhos
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano ideal para sua igreja e comece hoje mesmo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-card border rounded-2xl p-6 sm:p-8 flex flex-col",
                plan.highlighted
                  ? "border-primary shadow-xl md:scale-105 z-10"
                  : "border-border"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{plan.badge}</span>
                  <h3 className="text-xl font-bold text-foreground">
                    Plano {plan.name}
                  </h3>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={cn(
                      "text-sm",
                      feature.included ? "text-foreground" : "text-muted-foreground/50"
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
                {plan.extras?.map((extra, i) => (
                  <li key={`extra-${i}`} className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground font-medium">{extra}</span>
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
          Todos os planos incluem SSL gratuito, atualizações automáticas e suporte técnico. Cancele a qualquer momento.
        </p>
      </div>
    </section>
  );
};
