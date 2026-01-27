import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Star, Zap, CreditCard, AlertTriangle, CheckCircle, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChurch } from "@/contexts/ChurchContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlanInfo {
  name: string;
  price: number;
  icon: any;
  color: string;
  features: string[];
}

const PLANS: Record<string, PlanInfo> = {
  free: {
    name: "Gratuito",
    price: 0,
    icon: Star,
    color: "text-gray-500",
    features: ["Site básico", "Até 50 membros", "Suporte por email"],
  },
  prata: {
    name: "Prata",
    price: 69,
    icon: Star,
    color: "text-slate-500",
    features: ["Todas funcionalidades", "Até 200 membros", "Chat de ministérios", "Suporte prioritário"],
  },
  ouro: {
    name: "Ouro",
    price: 119,
    icon: Crown,
    color: "text-yellow-500",
    features: ["Todas funcionalidades", "Até 500 membros", "Chat de ministérios", "Blog", "Web Rádio", "Suporte premium"],
  },
  diamante: {
    name: "Diamante",
    price: 189,
    icon: Zap,
    color: "text-purple-500",
    features: ["Todas funcionalidades", "Membros ilimitados", "Tudo do Ouro", "Relatórios avançados", "API personalizada", "Suporte dedicado"],
  },
};

const AdminSubscription = () => {
  const { church } = useChurch();
  const [loading, setLoading] = useState(true);
  const [churchData, setChurchData] = useState<any>(null);
  const [changePlanDialog, setChangePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    if (church?.id) {
      fetchChurchData();
    }
  }, [church?.id]);

  const fetchChurchData = async () => {
    try {
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .eq("id", church?.id)
        .single();

      if (error) throw error;
      setChurchData(data);
    } catch (error) {
      console.error("Error fetching church data:", error);
      toast.error("Erro ao carregar dados da assinatura");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    if (!churchData) return;

    const currentPlan = churchData.plan || "free";
    const isUpgrade = PLANS[newPlan].price > PLANS[currentPlan].price;

    if (isUpgrade) {
      // Para upgrade, redirecionar para checkout
      setProcessing(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/asaas-checkout`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              churchId: churchData.id,
              plan: newPlan,
            }),
          }
        );

        const result = await response.json();
        if (result.checkoutUrl) {
          window.open(result.checkoutUrl, "_blank");
          toast.success("Redirecionando para o checkout...");
        } else {
          throw new Error(result.error || "Erro ao gerar checkout");
        }
      } catch (error: any) {
        console.error("Error generating checkout:", error);
        toast.error(error.message || "Erro ao processar upgrade");
      } finally {
        setProcessing(false);
        setChangePlanDialog(false);
      }
    } else {
      // Para downgrade, agendar para próximo ciclo
      setProcessing(true);
      try {
        const { error } = await supabase
          .from("churches")
          .update({
            settings: {
              ...churchData.settings,
              pending_plan: newPlan,
              pending_plan_date: new Date().toISOString(),
            },
          })
          .eq("id", churchData.id);

        if (error) throw error;

        toast.success(`Downgrade para ${PLANS[newPlan].name} agendado para o próximo ciclo de faturamento`);
        fetchChurchData();
      } catch (error: any) {
        toast.error("Erro ao agendar mudança de plano");
      } finally {
        setProcessing(false);
        setChangePlanDialog(false);
      }
    }
  };

  const handleCancelSubscription = async () => {
    if (!churchData?.asaas_subscription_id) {
      toast.error("Nenhuma assinatura ativa encontrada");
      return;
    }

    setProcessing(true);
    try {
      // Agendar cancelamento para próximo ciclo
      const { error } = await supabase
        .from("churches")
        .update({
          settings: {
            ...churchData.settings,
            cancellation_requested: true,
            cancellation_date: new Date().toISOString(),
          },
        })
        .eq("id", churchData.id);

      if (error) throw error;

      toast.success("Cancelamento agendado para o fim do período atual");
      setCancelDialog(false);
      fetchChurchData();
    } catch (error: any) {
      toast.error("Erro ao cancelar assinatura");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!churchData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Dados não encontrados
      </div>
    );
  }

  const currentPlan = PLANS[churchData.plan || "free"];
  const CurrentPlanIcon = currentPlan.icon;
  const isOverdue = churchData.payment_overdue_at;
  const isSuspended = churchData.status === "suspended";
  const pendingPlan = churchData.settings?.pending_plan;
  const cancellationRequested = churchData.settings?.cancellation_requested;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Assinatura</h1>
        <p className="text-muted-foreground mt-1">Gerencie seu plano e faturamento</p>
      </div>

      {/* Status Alerts */}
      {isSuspended && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Igreja Suspensa</AlertTitle>
          <AlertDescription>
            Sua igreja está suspensa devido a pagamentos pendentes. Regularize para restaurar o acesso.
          </AlertDescription>
        </Alert>
      )}

      {isOverdue && !isSuspended && (
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-400">Pagamento Pendente</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Você tem um pagamento em atraso desde{" "}
            {format(new Date(churchData.payment_overdue_at), "dd/MM/yyyy", { locale: ptBR })}.
            Regularize para evitar suspensão.
          </AlertDescription>
        </Alert>
      )}

      {cancellationRequested && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Cancelamento Agendado</AlertTitle>
          <AlertDescription>
            Sua assinatura será cancelada ao final do período atual. Você continuará com acesso até lá.
          </AlertDescription>
        </Alert>
      )}

      {pendingPlan && !cancellationRequested && (
        <Alert>
          <ArrowDownRight className="h-4 w-4" />
          <AlertTitle>Mudança de Plano Agendada</AlertTitle>
          <AlertDescription>
            Seu plano será alterado para {PLANS[pendingPlan]?.name} no próximo ciclo de faturamento.
          </AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CurrentPlanIcon className={`h-5 w-5 ${currentPlan.color}`} />
            Plano Atual: {currentPlan.name}
          </CardTitle>
          <CardDescription>
            {currentPlan.price === 0
              ? "Você está no plano gratuito"
              : `R$ ${currentPlan.price.toFixed(2).replace(".", ",")}/mês`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recursos incluídos:</h4>
              <ul className="space-y-1">
                {currentPlan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {churchData.asaas_subscription_id && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  ID da Assinatura:{" "}
                  <code className="bg-muted px-2 py-0.5 rounded">
                    {churchData.asaas_subscription_id}
                  </code>
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-4">
              <Button onClick={() => setChangePlanDialog(true)} disabled={cancellationRequested}>
                <CreditCard className="w-4 h-4 mr-2" />
                Alterar Plano
              </Button>

              {churchData.plan !== "free" && !cancellationRequested && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setCancelDialog(true)}
                >
                  Cancelar Assinatura
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(PLANS)
          .filter(([key]) => key !== "free" && key !== churchData.plan)
          .map(([key, plan]) => {
            const PlanIcon = plan.icon;
            const isUpgrade = plan.price > currentPlan.price;

            return (
              <Card key={key} className="relative">
                {key === "ouro" && (
                  <Badge className="absolute -top-2 -right-2 bg-yellow-500">Popular</Badge>
                )}
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlanIcon className={`h-5 w-5 ${plan.color}`} />
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    R$ {plan.price.toFixed(2).replace(".", ",")}/mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 mb-4">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={isUpgrade ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      setSelectedPlan(key);
                      setChangePlanDialog(true);
                    }}
                  >
                    {isUpgrade ? (
                      <>
                        <ArrowUpRight className="w-4 h-4 mr-1" />
                        Fazer Upgrade
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-4 h-4 mr-1" />
                        Fazer Downgrade
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Change Plan Dialog */}
      <Dialog open={changePlanDialog} onOpenChange={setChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Plano</DialogTitle>
            <DialogDescription>
              {selectedPlan && PLANS[selectedPlan].price > currentPlan.price
                ? "Você será redirecionado para o checkout para completar o upgrade."
                : "O downgrade será aplicado no próximo ciclo de faturamento."}
            </DialogDescription>
          </DialogHeader>

          {!selectedPlan && (
            <div className="space-y-2 py-4">
              {Object.entries(PLANS)
                .filter(([key]) => key !== churchData.plan)
                .map(([key, plan]) => {
                  const PlanIcon = plan.icon;
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setSelectedPlan(key)}
                    >
                      <PlanIcon className={`h-4 w-4 mr-2 ${plan.color}`} />
                      {plan.name} - R$ {plan.price.toFixed(2).replace(".", ",")}
                    </Button>
                  );
                })}
            </div>
          )}

          {selectedPlan && (
            <div className="py-4">
              <p className="text-center">
                Confirmar mudança para o plano{" "}
                <strong>{PLANS[selectedPlan].name}</strong>?
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChangePlanDialog(false);
                setSelectedPlan(null);
              }}
            >
              Cancelar
            </Button>
            {selectedPlan && (
              <Button
                onClick={() => handleChangePlan(selectedPlan)}
                disabled={processing}
              >
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onOpenChange={setCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso até o final do período pago.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(false)}>
              Manter Assinatura
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={processing}
            >
              {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscription;
