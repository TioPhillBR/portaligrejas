import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Trash2, Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PortalLogo } from "@/components/PortalLogo";
import { toast } from "sonner";

interface PendingChurch {
  id: string;
  name: string;
  slug: string;
  plan: string | null;
  created_at: string;
}

const CheckoutRecovery = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [pendingChurch, setPendingChurch] = useState<PendingChurch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login?redirect=/checkout/recuperar");
      return;
    }

    if (user) {
      fetchPendingChurch();
    }
  }, [user, authLoading, navigate]);

  const fetchPendingChurch = async () => {
    if (!user) return;

    try {
      // Check localStorage first
      const pendingChurchId = localStorage.getItem("pending_church_id");
      
      if (pendingChurchId) {
        const { data: church, error } = await supabase
          .from("churches")
          .select("id, name, slug, plan, created_at")
          .eq("id", pendingChurchId)
          .eq("status", "pending_payment")
          .maybeSingle();

        if (church) {
          setPendingChurch(church);
          setLoading(false);
          return;
        }
      }

      // Fallback: check by owner_id
      const { data: church, error } = await supabase
        .from("churches")
        .select("id, name, slug, plan, created_at")
        .eq("owner_id", user.id)
        .eq("status", "pending_payment")
        .order("created_at", { ascending: false })
        .maybeSingle();

      if (church) {
        setPendingChurch(church);
        localStorage.setItem("pending_church_id", church.id);
        if (church.plan) {
          localStorage.setItem("pending_plan", church.plan);
        }
      }
    } catch (error) {
      console.error("Error fetching pending church:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!pendingChurch || !user) return;

    setIsRetrying(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("user_id", user.id)
        .maybeSingle();

      const successUrl = `${window.location.origin}/checkout/sucesso?church=${pendingChurch.id}&wizard=true`;
      const cancelUrl = `${window.location.origin}/checkout/recuperar`;

      const response = await supabase.functions.invoke("asaas-checkout", {
        body: {
          churchId: pendingChurch.id,
          plan: pendingChurch.plan || localStorage.getItem("pending_plan") || "prata",
          customerName: profile?.full_name || user.email,
          customerEmail: user.email,
          customerCpfCnpj: "", // Will need to be filled in Asaas
          customerPhone: profile?.phone || "",
          successUrl,
          cancelUrl,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.paymentLink) {
        window.location.href = response.data.paymentLink;
      } else {
        throw new Error("Link de pagamento não gerado");
      }
    } catch (error: any) {
      console.error("Retry payment error:", error);
      toast.error(error.message || "Erro ao gerar link de pagamento");
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelAndRestart = async () => {
    if (!pendingChurch) return;

    setIsCancelling(true);

    try {
      // Delete pending church
      const { error } = await supabase
        .from("churches")
        .delete()
        .eq("id", pendingChurch.id)
        .eq("status", "pending_payment");

      if (error) throw error;

      // Clear localStorage
      localStorage.removeItem("pending_church_id");
      localStorage.removeItem("pending_plan");
      localStorage.removeItem("church_wizard_data");

      toast.success("Cadastro cancelado. Você pode começar novamente.");
      navigate("/criar-igreja");
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error("Erro ao cancelar cadastro");
    } finally {
      setIsCancelling(false);
    }
  };

  const getPlanName = (plan: string | null) => {
    const plans: Record<string, string> = {
      prata: "Prata",
      ouro: "Ouro",
      diamante: "Diamante",
    };
    return plan ? plans[plan] || plan : "Não selecionado";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <PortalLogo className="h-8 w-8" />
            <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {pendingChurch ? (
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl">Cadastro Pendente</CardTitle>
              <CardDescription>
                Encontramos um cadastro de igreja com pagamento pendente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Igreja:</span>
                  <span className="font-medium">{pendingChurch.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Endereço:</span>
                  <span className="font-medium">/{pendingChurch.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium">{getPlanName(pendingChurch.plan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Iniciado em:</span>
                  <span className="font-medium">{formatDate(pendingChurch.created_at)}</span>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Atenção:</strong> Cadastros pendentes são automaticamente cancelados após 24 horas.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleRetryPayment} 
                  className="w-full gap-2"
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  Continuar Pagamento
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleCancelAndRestart}
                  className="w-full gap-2"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Cancelar e Recomeçar
                </Button>

                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/")}
                  className="w-full gap-2"
                >
                  <Home className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Nenhum Cadastro Pendente</CardTitle>
              <CardDescription>
                Não encontramos nenhum cadastro de igreja pendente para sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={() => navigate("/criar-igreja")} className="w-full">
                  Criar Nova Igreja
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CheckoutRecovery;
