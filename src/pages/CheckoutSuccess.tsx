import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const churchId = searchParams.get("church");

  useEffect(() => {
    // Optional: Refresh church data or trigger a sync
  }, [churchId]);

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
            <Button onClick={() => navigate(`/admin`)} className="w-full">
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
