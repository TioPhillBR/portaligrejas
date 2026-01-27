import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";

const PLANS = [
  {
    key: "free",
    name: "Gratuito",
    price: 0,
    icon: Star,
    color: "from-slate-400 to-slate-500",
    features: [
      "Site básico",
      "Até 50 membros",
      "2 ministérios",
      "Eventos básicos",
    ],
    cta: "Plano Atual",
    disabled: true,
  },
  {
    key: "prata",
    name: "Prata",
    price: 49.90,
    icon: Star,
    color: "from-slate-400 to-slate-500",
    features: [
      "Site personalizado",
      "Até 500 membros",
      "5 ministérios",
      "Galeria de fotos",
      "Blog integrado",
      "Suporte por email",
    ],
    cta: "Assinar Prata",
  },
  {
    key: "ouro",
    name: "Ouro",
    price: 99.90,
    icon: Crown,
    color: "from-yellow-500 to-amber-600",
    popular: true,
    features: [
      "Tudo do Prata +",
      "Membros ilimitados",
      "Ministérios ilimitados",
      "Chat por ministério",
      "Notificações push",
      "Suporte prioritário",
    ],
    cta: "Assinar Ouro",
  },
  {
    key: "diamante",
    name: "Diamante",
    price: 199.90,
    icon: Zap,
    color: "from-purple-500 to-indigo-600",
    features: [
      "Tudo do Ouro +",
      "App mobile dedicado",
      "Transmissão ao vivo",
      "Relatórios avançados",
      "Domínio personalizado",
      "Suporte 24/7",
    ],
    cta: "Assinar Diamante",
  },
];

interface PricingPageProps {
  churchId?: string;
}

const PricingPage = ({ churchId }: PricingPageProps) => {
  const navigate = useNavigate();

  const handleSelectPlan = (planKey: string) => {
    if (planKey === "free") return;
    
    if (churchId) {
      navigate(`/checkout?church=${churchId}&plan=${planKey}`);
    } else {
      // If no church, redirect to create one first
      navigate(`/criar-igreja?plan=${planKey}`);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para sua igreja
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comece gratuitamente e evolua conforme sua comunidade cresce.
            Todos os planos incluem suporte e atualizações.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const PlanIcon = plan.icon;
            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <div
                    className={`mx-auto p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-3`}
                  >
                    <PlanIcon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription className="min-h-[3rem]">
                    <span className="text-3xl font-bold text-foreground">
                      {plan.price === 0
                        ? "Grátis"
                        : `R$ ${plan.price.toFixed(2).replace(".", ",")}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/mês</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.disabled}
                    onClick={() => handleSelectPlan(plan.key)}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Dúvidas? Entre em contato:{" "}
            <a
              href="mailto:contato@portaligrejas.com.br"
              className="text-primary hover:underline"
            >
              contato@portaligrejas.com.br
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
