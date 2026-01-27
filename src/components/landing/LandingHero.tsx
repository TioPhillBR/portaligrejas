import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useEffect } from "react";

export const LandingHero = () => {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSlug = useDebounce(slug, 500);

  // Normalize slug
  const normalizeSlug = (value: string) => {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeSlug(e.target.value);
    setSlug(normalized);
    setIsAvailable(null);
    setError(null);
  };

  // Check availability when slug changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedSlug || debouncedSlug.length < 3) {
        setIsAvailable(null);
        return;
      }

      setIsChecking(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from("churches")
          .select("id")
          .eq("slug", debouncedSlug)
          .maybeSingle();

        if (fetchError) throw fetchError;

        setIsAvailable(!data);
      } catch (err) {
        console.error("Error checking slug:", err);
        setError("Erro ao verificar disponibilidade");
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedSlug]);

  const handleContinue = () => {
    if (isAvailable && slug.length >= 3) {
      navigate(`/criar-igreja?slug=${slug}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Animated circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>A plataforma mais fácil para igrejas</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Portal{" "}
            <span className="text-primary">Igrejas</span>
          </h1>

          {/* Slogan */}
          <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mb-12">
            Seu site no ar em poucos minutos
          </p>

          {/* URL Checker */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
              <p className="text-sm text-muted-foreground mb-4">
                Escolha o endereço do seu site:
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="flex items-center bg-muted rounded-lg overflow-hidden border border-input focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                    <span className="px-3 text-muted-foreground text-sm whitespace-nowrap">
                      portaligrejas.com/igreja/
                    </span>
                    <Input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="sua-igreja"
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    <div className="px-3">
                      {isChecking && (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      )}
                      {!isChecking && isAvailable === true && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {!isChecking && isAvailable === false && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={!isAvailable || slug.length < 3}
                  className="gap-2 whitespace-nowrap"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Status messages */}
              <div className="mt-3 h-6">
                {slug.length > 0 && slug.length < 3 && (
                  <p className="text-sm text-muted-foreground">
                    O endereço deve ter pelo menos 3 caracteres
                  </p>
                )}
                {isAvailable === true && (
                  <p className="text-sm text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Este endereço está disponível!
                  </p>
                )}
                {isAvailable === false && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Este endereço já está em uso
                  </p>
                )}
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Grátis para começar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Pronto em minutos</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
