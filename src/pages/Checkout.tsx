import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PLANS = {
  prata: {
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
  },
  ouro: {
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
  },
  diamante: {
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
  },
};

interface CheckoutFormData {
  name: string;
  email: string;
  cpfCnpj: string;
  phone: string;
}

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const churchId = searchParams.get("church");
  const planKey = searchParams.get("plan") as keyof typeof PLANS;
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "",
    email: user?.email || "",
    cpfCnpj: "",
    phone: "",
  });

  const plan = planKey ? PLANS[planKey] : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Você precisa estar logado para continuar");
      navigate("/login");
      return;
    }

    if (!churchId || !planKey) {
      toast.error("Dados inválidos");
      return;
    }

    if (!formData.name || !formData.email || !formData.cpfCnpj) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        navigate("/login");
        return;
      }

      const successUrl = `${window.location.origin}/checkout/sucesso?church=${churchId}`;
      const cancelUrl = `${window.location.origin}/checkout?church=${churchId}&plan=${planKey}`;

      const response = await supabase.functions.invoke("asaas-checkout", {
        body: {
          churchId,
          plan: planKey,
          customerName: formData.name,
          customerEmail: formData.email,
          customerCpfCnpj: formData.cpfCnpj,
          customerPhone: formData.phone,
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
      console.error("Checkout error:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setLoading(false);
    }
  };

  if (!plan || !churchId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>Dados inválidos</CardTitle>
            <CardDescription>
              O link de checkout está incompleto ou inválido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const PlanIcon = plan.icon;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Finalizar Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Complete seus dados para ativar o plano
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                    <PlanIcon className="w-5 h-5 text-white" />
                  </div>
                  Plano {plan.name}
                </CardTitle>
                {"popular" in plan && plan.popular && (
                  <Badge variant="secondary">Mais Popular</Badge>
                )}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  R$ {plan.price.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-muted-foreground">/mês</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados para pagamento</CardTitle>
              <CardDescription>
                Informe seus dados para gerar o link de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                  <Input
                    id="cpfCnpj"
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cpfCnpj: formatCpfCnpj(e.target.value),
                      }))
                    }
                    placeholder="000.000.000-00"
                    maxLength={18}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: formatPhone(e.target.value),
                      }))
                    }
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>Continuar para pagamento</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Você será redirecionado para a página segura de pagamento.
                  Aceitamos cartão de crédito, boleto e PIX.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
