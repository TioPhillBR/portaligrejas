import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Crown, Star, Zap, Gift, Sparkles, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    key: "prata",
    name: "Prata",
    price: 69,
    icon: Star,
    color: "from-slate-400 to-slate-500",
    features: [
      "Site personalizado",
      "Até 500 membros",
      "5 ministérios",
      "Galeria de fotos",
      "Blog integrado",
    ],
  },
  {
    key: "ouro",
    name: "Ouro",
    price: 119,
    icon: Crown,
    color: "from-yellow-500 to-amber-600",
    popular: true,
    features: [
      "Tudo do Prata +",
      "Membros ilimitados",
      "Ministérios ilimitados",
      "Chat por ministério",
      "Notificações push",
    ],
  },
  {
    key: "diamante",
    name: "Diamante",
    price: 189,
    icon: Zap,
    color: "from-purple-500 to-indigo-600",
    features: [
      "Tudo do Ouro +",
      "Transmissão ao vivo",
      "Relatórios avançados",
      "Domínio personalizado",
      "Suporte 24/7",
    ],
  },
];

interface WizardStepPlanProps {
  selectedPlan: string | null;
  onSelectPlan: (plan: string) => void;
  grantedAccount: {
    hasGrantedAccount: boolean;
    plan?: string;
    expiresAt?: string;
  } | null;
  onBack: () => void;
  showBack: boolean;
}

const WizardStepPlan = ({
  selectedPlan,
  onSelectPlan,
  grantedAccount,
  onBack,
  showBack,
}: WizardStepPlanProps) => {
  return (
    <div className="space-y-6">
      {/* Free Account Alert */}
      {grantedAccount?.hasGrantedAccount && (
        <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950/20">
          <Gift className="h-4 w-4 text-purple-600" />
          <AlertTitle className="text-purple-800 dark:text-purple-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Conta Gratuita Disponível!
          </AlertTitle>
          <AlertDescription className="text-purple-700 dark:text-purple-300">
            Você possui um plano <strong>{grantedAccount.plan?.toUpperCase()}</strong> pré-aprovado.
            Clique no botão abaixo para continuar com seu plano gratuito!
            {grantedAccount.expiresAt && (
              <span className="block text-xs mt-1">
                Válido até: {new Date(grantedAccount.expiresAt).toLocaleDateString("pt-BR")}
              </span>
            )}
            <Button
              onClick={() => onSelectPlan(grantedAccount.plan || "prata")}
              className="mt-3 bg-purple-600 hover:bg-purple-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              Usar Conta Gratuita
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Escolha seu plano</CardTitle>
          <CardDescription>
            Selecione o plano ideal para sua igreja
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const PlanIcon = plan.icon;
              const isSelected = selectedPlan === plan.key;

              return (
                <div
                  key={plan.key}
                  className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  } ${plan.popular ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  onClick={() => onSelectPlan(plan.key)}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary">
                      Popular
                    </Badge>
                  )}
                  <div className="text-center mb-4">
                    <div
                      className={`mx-auto p-2 rounded-lg bg-gradient-to-br ${plan.color} w-fit mb-2`}
                    >
                      <PlanIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div className="text-2xl font-bold text-foreground">
                      R$ {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-lg border-2 border-primary pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {showBack && (
            <div className="mt-6">
              <Button variant="ghost" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardStepPlan;
