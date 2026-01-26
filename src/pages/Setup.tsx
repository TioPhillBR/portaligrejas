import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";

const Setup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = checking, 1 = form, 2 = success
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingAdmin();
  }, []);

  const checkExistingAdmin = async () => {
    try {
      const { count } = await supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "super_admin");

      if (count && count > 0) {
        // Admin already exists, redirect to login
        navigate("/login");
      } else {
        setStep(1);
      }
    } catch (error) {
      setStep(1);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await supabase.functions.invoke("setup-admin", {
        body: { email, password, fullName },
      });

      if (response.error) {
        throw new Error(response.error.message || "Erro ao criar administrador");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({
        title: "Administrador criado com sucesso!",
        description: "Você já pode fazer login no painel administrativo.",
      });

      setStep(2);
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <CardTitle className="text-2xl font-display">
            {step === 0 ? "Verificando..." : step === 1 ? "Configuração Inicial" : "Configuração Concluída!"}
          </CardTitle>
          <CardDescription>
            {step === 0
              ? "Aguarde um momento"
              : step === 1
              ? "Crie a conta do administrador principal"
              : "Seu painel está pronto para uso"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div>
                <Input
                  placeholder="Nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="E-mail do administrador"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={loading}
              >
                {loading ? (
                  "Criando..."
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Criar Administrador
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 inline-block">
                <Shield className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-muted-foreground">
                A conta de administrador foi criada. Agora você pode acessar o painel e gerenciar todo o site da igreja.
              </p>
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-12"
              >
                Ir para o Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
