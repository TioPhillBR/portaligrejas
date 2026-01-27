import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Check, Crown, Star, Zap, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLANS = {
  prata: {
    name: "Prata",
    price: 69,
    icon: Star,
    color: "from-slate-400 to-slate-500",
  },
  ouro: {
    name: "Ouro",
    price: 119,
    icon: Crown,
    color: "from-yellow-500 to-amber-600",
  },
  diamante: {
    name: "Diamante",
    price: 189,
    icon: Zap,
    color: "from-purple-500 to-indigo-600",
  },
};

const checkoutSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpfCnpj: z.string().min(11, "CPF/CNPJ inválido"),
  phone: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface WizardStepCheckoutProps {
  selectedPlan: string;
  churchData: {
    churchName: string;
    slug: string;
    email: string;
    phone: string;
    description: string;
  };
  userEmail?: string;
  userName?: string;
  onBack: () => void;
  onSuccess: (churchId: string) => void;
}

const WizardStepCheckout = ({
  selectedPlan,
  churchData,
  userEmail,
  userName,
  onBack,
  onSuccess,
}: WizardStepCheckoutProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plan = PLANS[selectedPlan as keyof typeof PLANS];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: userName || "",
      email: userEmail || "",
      cpfCnpj: "",
      phone: "",
    },
  });

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

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      // 1. Create church with pending_payment status
      const { data: churchId, error: churchError } = await supabase.rpc(
        "create_church_with_defaults",
        {
          p_name: churchData.churchName,
          p_slug: churchData.slug,
          p_owner_id: user.id,
          p_email: churchData.email || data.email,
          p_phone: churchData.phone || null,
          p_description: churchData.description || null,
        }
      );

      if (churchError) {
        if (churchError.code === "23505") {
          throw new Error("Este endereço já está em uso. Escolha outro.");
        }
        throw churchError;
      }

      // 2. Update church with pending_payment status and plan
      await supabase
        .from("churches")
        .update({ 
          status: "pending_payment",
          plan: selectedPlan,
        })
        .eq("id", churchId);

      // 3. Save wizard data to localStorage for recovery
      localStorage.setItem("pending_church_id", churchId);
      localStorage.setItem("pending_plan", selectedPlan);

      // 4. Generate Asaas checkout link
      const successUrl = `${window.location.origin}/checkout/sucesso?church=${churchId}&wizard=true`;
      const cancelUrl = `${window.location.origin}/criar-igreja/wizard?recovery=true`;

      const response = await supabase.functions.invoke("asaas-checkout", {
        body: {
          churchId,
          plan: selectedPlan,
          customerName: data.name,
          customerEmail: data.email,
          customerCpfCnpj: data.cpfCnpj.replace(/\D/g, ""),
          customerPhone: data.phone?.replace(/\D/g, "") || "",
          successUrl,
          cancelUrl,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.paymentLink) {
        // Redirect to Asaas payment page
        window.location.href = response.data.paymentLink;
      } else {
        throw new Error("Link de pagamento não gerado");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Erro ao processar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) {
    return null;
  }

  const PlanIcon = plan.icon;

  return (
    <div className="space-y-6">
      {/* Plan Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.color}`}>
                <PlanIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">Plano {plan.name}</p>
                <p className="text-sm text-muted-foreground">
                  Igreja: {churchData.churchName}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              R$ {plan.price}/mês
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Checkout Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Dados para Pagamento
          </CardTitle>
          <CardDescription>
            Informe seus dados para gerar o link de pagamento seguro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
              <Input
                id="cpfCnpj"
                placeholder="000.000.000-00"
                maxLength={18}
                {...register("cpfCnpj")}
                onChange={(e) => {
                  const formatted = formatCpfCnpj(e.target.value);
                  setValue("cpfCnpj", formatted);
                }}
              />
              {errors.cpfCnpj && (
                <p className="text-sm text-destructive">{errors.cpfCnpj.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                maxLength={15}
                {...register("phone")}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue("phone", formatted);
                }}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Pagamento 100% seguro via Asaas
              </p>
              <p className="flex items-center gap-2 mt-1">
                <Check className="w-4 h-4 text-green-500" />
                Aceitamos cartão, boleto e PIX
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar para Pagamento"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WizardStepCheckout;
