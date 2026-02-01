import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Logo from "@/components/Logo";
import PageTransition from "@/components/PageTransition";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }

    setLoading(false);
  };

  if (sent) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display">Email Enviado!</CardTitle>
              <CardDescription>
                Enviamos um link para <strong>{email}</strong>. Verifique sua caixa de entrada (e a pasta de spam) para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSent(false)}
              >
                Enviar novamente
              </Button>
              <Link to="/login" className="block">
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para o login
                </Button>
              </Link>
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
            <CardTitle className="text-2xl font-display">Esqueci minha senha</CardTitle>
            <CardDescription>
              Digite seu email e enviaremos um link para você redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 gap-2"
                disabled={loading}
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Enviar link de recuperação
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ForgotPassword;
