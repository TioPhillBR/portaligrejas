import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import PageTransition from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";

interface GrantInfo {
  id: string;
  email: string;
  plan: string;
  expires_at: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  prata: "Prata",
  ouro: "Ouro",
  diamante: "Diamante",
};

const RegisterWithGrant = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { signUp } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [grantInfo, setGrantInfo] = useState<GrantInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    birthDate: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Token inválido ou não fornecido");
      setValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase
        .from("granted_free_accounts")
        .select("id, email, plan, expires_at, is_used")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Link inválido ou expirado");
        return;
      }

      if (data.is_used) {
        setError("Este link já foi utilizado");
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("Este link expirou");
        return;
      }

      setGrantInfo({
        id: data.id,
        email: data.email,
        plan: data.plan,
        expires_at: data.expires_at,
      });
      
      // Pre-fill email
      setFormData(prev => ({ ...prev, email: data.email }));
    } catch (err) {
      console.error("Error validating token:", err);
      setError("Erro ao validar o link");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!grantInfo) return;

    // Verify email matches
    if (formData.email.toLowerCase() !== grantInfo.email.toLowerCase()) {
      toast({
        title: "Erro",
        description: "O email deve ser o mesmo do convite: " + grantInfo.email,
        variant: "destructive",
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create account
      const { error: signUpError } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        {
          phone: formData.phone,
          gender: formData.gender,
          birth_date: formData.birthDate || null,
        }
      );

      if (signUpError) {
        throw signUpError;
      }

      // Mark grant as used
      const { error: updateError } = await supabase
        .from("granted_free_accounts")
        .update({ 
          is_used: true, 
          used_at: new Date().toISOString() 
        })
        .eq("id", grantInfo.id);

      if (updateError) {
        console.error("Error marking grant as used:", updateError);
      }

      toast({
        title: "Conta criada com sucesso!",
        description: `Seu plano ${PLAN_LABELS[grantInfo.plan]} foi ativado. Redirecionando...`,
      });
      
      // Redirect to church creation wizard with plan pre-selected
      navigate(`/criar-igreja/wizard?plan=${grantInfo.plan}&grant=${grantInfo.id}`);
    } catch (error: any) {
      console.error("Error creating account:", error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Validando seu convite...</p>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Logo size="lg" />
              </div>
              <CardTitle className="text-2xl font-display text-destructive">Link Inválido</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Este link de registro não é válido ou já foi utilizado.
              </p>
              <div className="flex flex-col gap-2">
                <Link to="/cadastro">
                  <Button variant="outline" className="w-full">
                    Cadastro Normal
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" className="w-full">
                    Voltar para o site
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-primary" />
              <Badge 
                variant="secondary" 
                className={
                  grantInfo?.plan === "diamante"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                    : grantInfo?.plan === "ouro"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                }
              >
                Plano {PLAN_LABELS[grantInfo?.plan || "prata"]} Gratuito
              </Badge>
            </div>
            <CardTitle className="text-2xl font-display">Criar Sua Conta</CardTitle>
            <CardDescription>
              Você foi convidado para um plano gratuito. Complete seu cadastro abaixo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="h-11 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O email é pré-definido pelo convite
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="relative">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[34px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Criar Conta e Ativar Plano
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Fazer login
                </Link>
              </p>
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary block">
                ← Voltar para o site
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default RegisterWithGrant;
