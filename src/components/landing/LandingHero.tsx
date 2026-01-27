import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";

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

  const handleVerify = () => {
    if (slug.length >= 3 && !isChecking) {
      // Force re-check
      setIsAvailable(null);
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
          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Um site profissional para sua igreja,{" "}
            <span className="text-primary">sem complicação</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
            Crie agora o site da sua igreja com domínio personalizado, design moderno e suporte completo.
          </p>

          {/* URL Checker */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
              <p className="text-base sm:text-lg text-foreground font-medium mb-4">
                Escolha o endereço do seu site:
              </p>
              
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <div className="flex items-center bg-muted rounded-xl overflow-hidden border border-input focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                    <span className="px-3 sm:px-4 text-muted-foreground text-sm sm:text-base whitespace-nowrap">
                      portaligrejas.com/
                    </span>
                    <Input
                      type="text"
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="sua-igreja"
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base sm:text-lg h-12 sm:h-14"
                    />
                    <div className="px-3 sm:px-4">
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

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleVerify}
                    disabled={slug.length < 3 || isChecking}
                    className="gap-2 flex-1 h-12 sm:h-14"
                  >
                    <Search className="w-4 h-4" />
                    Verificar disponibilidade
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    disabled={!isAvailable || slug.length < 3}
                    className="gap-2 flex-1 h-12 sm:h-14"
                  >
                    Criar meu site agora
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status messages */}
              <div className="mt-4 min-h-[24px]">
                {slug.length > 0 && slug.length < 3 && (
                  <p className="text-sm text-muted-foreground">
                    O endereço deve ter pelo menos 3 caracteres
                  </p>
                )}
                {isAvailable === true && (
                  <p className="text-sm sm:text-base text-green-500 flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-5 h-5" />
                    portaligrejas.com/{slug} está disponível!
                  </p>
                )}
                {isAvailable === false && (
                  <p className="text-sm sm:text-base text-destructive flex items-center justify-center gap-2 font-medium">
                    <XCircle className="w-5 h-5" />
                    Este nome já está em uso. Tente outro.
                  </p>
                )}
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trust indicators - Updated for paid plans */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-muted-foreground text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Pronto em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Suporte completo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>Cancele quando quiser</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
