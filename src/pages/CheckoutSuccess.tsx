import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const churchId = searchParams.get("church");
  const isFromWizard = searchParams.get("wizard") === "true";
  
  const [status, setStatus] = useState<"checking" | "active" | "pending" | "error">("checking");
  const [churchSlug, setChurchSlug] = useState<string | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    if (!churchId) {
      setStatus("error");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const checkChurchStatus = async () => {
      try {
        const { data: church, error } = await supabase
          .from("churches")
          .select("status, slug, plan")
          .eq("id", churchId)
          .single();

        if (error) throw error;

        if (church?.status === "active") {
          setStatus("active");
          setChurchSlug(church.slug);
          
          // Clear localStorage
          localStorage.removeItem("church_wizard_data");
          localStorage.removeItem("pending_church_id");
          localStorage.removeItem("pending_plan");

          // Stop polling
          if (intervalId) clearInterval(intervalId);
        } else {
          setCheckCount(prev => prev + 1);
          
          // After 30 seconds (6 checks), show manual button
          if (checkCount >= 6) {
            setStatus("pending");
            if (intervalId) clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error checking church status:", error);
        setCheckCount(prev => prev + 1);
        
        if (checkCount >= 6) {
          setStatus("error");
          if (intervalId) clearInterval(intervalId);
        }
      }
    };

    // Initial check
    checkChurchStatus();

    // Poll every 5 seconds
    intervalId = setInterval(checkChurchStatus, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [churchId, checkCount]);

  const handleGoToAdmin = () => {
    if (churchSlug) {
      navigate(`/${churchSlug}/admin`);
    } else {
      navigate("/admin");
    }
  };

  const handleRetry = async () => {
    setStatus("checking");
    setCheckCount(0);
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl">Processando pagamento...</CardTitle>
            <CardDescription className="text-base">
              Aguarde enquanto confirmamos seu pagamento. Isso pode levar alguns segundos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Não feche esta página. Você será redirecionado automaticamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl">Pagamento em processamento</CardTitle>
            <CardDescription className="text-base">
              Seu pagamento está sendo processado. Isso pode levar alguns minutos dependendo do método de pagamento escolhido.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Cartão de crédito:</strong> Confirmação geralmente instantânea<br />
                <strong>Boleto:</strong> Pode levar até 3 dias úteis<br />
                <strong>PIX:</strong> Confirmação em poucos minutos
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Verificar novamente
              </Button>
              <Button onClick={() => navigate("/")} variant="ghost" className="w-full">
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Erro ao verificar pagamento</CardTitle>
            <CardDescription className="text-base">
              Não foi possível verificar o status do seu pagamento. Por favor, entre em contato com o suporte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                Tentar novamente
              </Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">
                Voltar ao início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            Pagamento Confirmado!
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </CardTitle>
          <CardDescription className="text-base">
            Sua assinatura foi ativada com sucesso. Aproveite todos os recursos
            do seu novo plano!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Você receberá um e-mail com os detalhes da sua assinatura e as
              instruções para acessar todos os recursos do seu plano.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleGoToAdmin} className="w-full">
              Ir para o Painel Administrativo
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSuccess;
