import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Church, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { ChurchFormData } from "@/pages/onboarding/ChurchWizard";
import { useEffect } from "react";

const churchSchema = z.object({
  churchName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  slug: z.string().min(3, "URL deve ter pelo menos 3 caracteres").max(50),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  description: z.string().max(500).optional(),
});

interface WizardStepChurchProps {
  data: ChurchFormData;
  onChange: (data: ChurchFormData) => void;
  onSubmit: (data: ChurchFormData) => void;
  onBack: () => void;
  isSubmitting: boolean;
  selectedPlan: string | null | undefined;
}

const WizardStepChurch = ({
  data,
  onChange,
  onSubmit,
  onBack,
  isSubmitting,
  selectedPlan,
}: WizardStepChurchProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChurchFormData>({
    resolver: zodResolver(churchSchema),
    defaultValues: data,
  });

  const formData = watch();

  // Sync form data with parent
  useEffect(() => {
    onChange(formData);
  }, [formData.churchName, formData.slug, formData.email, formData.phone, formData.description]);

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

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-2xl">Dados da Igreja</CardTitle>
          {selectedPlan && (
            <Badge variant="secondary" className="capitalize">
              Plano {selectedPlan}
            </Badge>
          )}
        </div>
        <CardDescription>
          Preencha as informações básicas da sua igreja
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="slug">Endereço do Site</Label>
            <div className="flex items-center bg-muted rounded-lg overflow-hidden border border-input">
              <span className="px-3 text-muted-foreground text-sm whitespace-nowrap">
                portaligrejas.com/
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

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Uma breve descrição da sua igreja..."
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando igreja...
                </>
              ) : (
                "Criar Igreja"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default WizardStepChurch;
