import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
import { AuthFormData } from "@/pages/onboarding/ChurchWizard";

const authSchema = z.object({
  userName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  userEmail: z.string().email("Email inválido"),
  userPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
}).refine((data) => data.userPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

interface WizardStepAuthProps {
  onSubmit: (data: AuthFormData) => void;
  onLogin: () => void;
  isSubmitting: boolean;
}

const WizardStepAuth = ({ onSubmit, onLogin, isSubmitting }: WizardStepAuthProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar sua conta</CardTitle>
        <CardDescription>
          Primeiro, crie sua conta para gerenciar sua igreja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="userPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha
            </Label>
            <div className="relative">
              <Input
                id="userPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                {...register("userPassword")}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.userPassword && (
              <p className="text-sm text-destructive">{errors.userPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar Conta e Continuar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={onLogin}
              className="text-primary hover:underline font-medium"
            >
              Fazer login
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WizardStepAuth;
