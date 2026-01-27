import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalLogo } from "@/components/PortalLogo";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, CheckCircle2, Church, Mail, Phone, User } from "lucide-react";

const createChurchSchema = z.object({
  churchName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  slug: z.string().min(3, "URL deve ter pelo menos 3 caracteres").max(50),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  description: z.string().max(500).optional(),
  // User fields (if not logged in)
  userName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  userEmail: z.string().email("Email inválido").optional(),
  userPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional(),
});

type CreateChurchForm = z.infer<typeof createChurchSchema>;

const CreateChurch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const initialSlug = searchParams.get("slug") || "";

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateChurchForm>({
    resolver: zodResolver(createChurchSchema),
    defaultValues: {
      slug: initialSlug,
      churchName: "",
      email: "",
      phone: "",
      description: "",
    },
  });

  const slug = watch("slug");

  // Normalize slug on change
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = e.target.value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setValue("slug", normalized);
  };

  const onSubmit = async (data: CreateChurchForm) => {
    setIsSubmitting(true);

    try {
      let userId = user?.id;

      // If user is not logged in, create account first
      if (!user) {
        if (!data.userName || !data.userEmail || !data.userPassword) {
          toast({
            title: "Erro",
            description: "Preencha todos os dados para criar sua conta",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.userEmail,
          password: data.userPassword,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: data.userName,
            },
          },
        });

        if (authError) throw authError;
        userId = authData.user?.id;

        if (!userId) {
          throw new Error("Erro ao criar conta");
        }
      }

      // Create church using the database function
      const { data: churchId, error: churchError } = await supabase.rpc(
        "create_church_with_defaults",
        {
          p_name: data.churchName,
          p_slug: data.slug,
          p_owner_id: userId!,
          p_email: data.email,
          p_phone: data.phone || null,
          p_description: data.description || null,
        }
      );

      if (churchError) {
        if (churchError.code === "23505") {
          throw new Error("Este endereço já está em uso. Escolha outro.");
        }
        throw churchError;
      }

      toast({
        title: "Igreja criada com sucesso!",
        description: "Você será redirecionado para o painel administrativo.",
      });

      // Redirect to church admin
      setTimeout(() => {
        navigate(`/igreja/${data.slug}/admin`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating church:", error);
      toast({
        title: "Erro ao criar igreja",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <PortalLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {step === 1 ? "Dados da Igreja" : "Sua Conta"}
              </CardTitle>
              <CardDescription>
                {step === 1
                  ? "Preencha as informações básicas da sua igreja"
                  : "Crie sua conta para gerenciar a igreja"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <>
                    {/* Church Name */}
                    <div className="space-y-2">
                      <Label htmlFor="churchName" className="flex items-center gap-2">
                        <Church className="w-4 h-4" />
                        Nome da Igreja
                      </Label>
                      <Input
                        id="churchName"
                        placeholder="Ex: Igreja Batista Central"
                        {...register("churchName")}
                      />
                      {errors.churchName && (
                        <p className="text-sm text-destructive">{errors.churchName.message}</p>
                      )}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                      <Label htmlFor="slug">Endereço do Site</Label>
                      <div className="flex items-center bg-muted rounded-lg overflow-hidden border border-input">
                        <span className="px-3 text-muted-foreground text-sm whitespace-nowrap">
                          portaligrejas.com/igreja/
                        </span>
                        <Input
                          id="slug"
                          placeholder="sua-igreja"
                          className="border-0 bg-transparent focus-visible:ring-0"
                          {...register("slug")}
                          onChange={handleSlugChange}
                        />
                      </div>
                      {errors.slug && (
                        <p className="text-sm text-destructive">{errors.slug.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email da Igreja
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contato@suaigreja.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Telefone (opcional)
                      </Label>
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        {...register("phone")}
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição (opcional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Uma breve descrição da sua igreja..."
                        rows={3}
                        {...register("description")}
                      />
                    </div>

                    <Button
                      type="button"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        if (user) {
                          handleSubmit(onSubmit)();
                        } else {
                          setStep(2);
                        }
                      }}
                    >
                      {user ? (
                        isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando igreja...
                          </>
                        ) : (
                          "Criar Igreja"
                        )
                      ) : (
                        "Continuar"
                      )}
                    </Button>
                  </>
                )}

                {step === 2 && !user && (
                  <>
                    {/* User Name */}
                    <div className="space-y-2">
                      <Label htmlFor="userName" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Seu Nome Completo
                      </Label>
                      <Input
                        id="userName"
                        placeholder="Seu nome"
                        {...register("userName")}
                      />
                      {errors.userName && (
                        <p className="text-sm text-destructive">{errors.userName.message}</p>
                      )}
                    </div>

                    {/* User Email */}
                    <div className="space-y-2">
                      <Label htmlFor="userEmail" className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Seu Email
                      </Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="seu@email.com"
                        {...register("userEmail")}
                      />
                      {errors.userEmail && (
                        <p className="text-sm text-destructive">{errors.userEmail.message}</p>
                      )}
                    </div>

                    {/* User Password */}
                    <div className="space-y-2">
                      <Label htmlFor="userPassword">Senha</Label>
                      <Input
                        id="userPassword"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        {...register("userPassword")}
                      />
                      {errors.userPassword && (
                        <p className="text-sm text-destructive">{errors.userPassword.message}</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                      >
                        Voltar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          "Criar Igreja"
                        )}
                      </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Já tem uma conta?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Faça login
                      </Link>
                    </p>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Site pronto em minutos</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Suporte dedicado</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateChurch;
