import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Heart, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DonationSettings {
  pix_key?: string;
  pix_type?: string;
  pix_image_url?: string;
  bank_name?: string;
  bank_code?: string;
  agency?: string;
  account?: string;
  holder?: string;
  cnpj?: string;
}

interface DonationsSectionProps {
  sectionData?: {
    title: string | null;
    subtitle: string | null;
    content: {
      badge?: string;
      description?: string;
      bible_verse?: string;
      bible_reference?: string;
    };
  };
}

const DonationsSection = ({ sectionData }: DonationsSectionProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copiedPix, setCopiedPix] = useState(false);
  const [settings, setSettings] = useState<DonationSettings>({});
  const [loading, setLoading] = useState(true);

  const content = sectionData?.content || {};
  const badge = content.badge || "Contribua";
  const title = sectionData?.title || "Dízimos e Ofertas";
  const subtitle = sectionData?.subtitle || content.description || "Sua contribuição ajuda a manter nossa obra missionária e projetos sociais. Contribua de forma fácil e segura.";
  const bibleVerse = content.bible_verse || '"Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria."';
  const bibleReference = content.bible_reference || "2 Coríntios 9:7";

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "donations")
        .maybeSingle();

      if (!error && data) {
        setSettings(data.value as DonationSettings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const pixKey = settings.pix_key || "contato@igrejaluz.com.br";
  const pixType = settings.pix_type || "email";

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    toast({
      title: "Chave PIX copiada!",
      description: "Cole no seu aplicativo de banco.",
    });
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <section id="contribuicoes" className="section-padding bg-gradient-to-br from-gold/10 to-gold/5" ref={ref}>
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1 mb-4 rounded-full bg-gold/20 text-gold text-sm font-medium">
            <Heart className="w-4 h-4 inline mr-2" />
            {badge}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, -1).join(" ")} <span className="text-gold">{title.split(" ").slice(-1)}</span>
              </>
            ) : (
              <span className="text-gold">{title}</span>
            )}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* PIX Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-gold/30 bg-card h-full">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-gold" />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  PIX
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Escaneie o QR Code ou copie a chave PIX
                </p>

                {/* QR Code Image or Placeholder */}
                <div className="bg-white p-4 rounded-lg inline-block mb-6">
                  {settings.pix_image_url ? (
                    <img
                      src={settings.pix_image_url}
                      alt="QR Code PIX"
                      className="w-40 h-40 object-contain"
                    />
                  ) : (
                    <div className="w-40 h-40 bg-muted rounded flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* PIX Key */}
                <div className="bg-secondary/50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">
                    Chave PIX ({pixType === "email" ? "E-mail" : pixType === "cpf" ? "CPF" : pixType === "cnpj" ? "CNPJ" : pixType === "phone" ? "Telefone" : "Aleatória"})
                  </p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {pixKey}
                  </p>
                </div>

                <Button
                  onClick={copyPixKey}
                  className="w-full gap-2"
                  variant={copiedPix ? "outline" : "default"}
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bank Transfer Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/50 bg-card h-full">
              <CardContent className="p-6 md:p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-2xl font-display font-bold text-foreground mb-2 text-center">
                  Transferência Bancária
                </h3>
                <p className="text-muted-foreground text-sm mb-6 text-center">
                  Dados para depósito ou transferência
                </p>

                <div className="space-y-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Banco</p>
                    <p className="font-semibold text-foreground">
                      {settings.bank_name || "Banco do Brasil"} ({settings.bank_code || "001"})
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Agência</p>
                      <p className="font-semibold text-foreground">{settings.agency || "1234-5"}</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4">
                      <p className="text-xs text-muted-foreground mb-1">Conta</p>
                      <p className="font-semibold text-foreground">{settings.account || "12345-6"}</p>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Titular</p>
                    <p className="font-semibold text-foreground">
                      {settings.holder || "Igreja Luz do Evangelho"}
                    </p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">CNPJ</p>
                    <p className="font-semibold text-foreground">
                      {settings.cnpj || "12.345.678/0001-90"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bible Verse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground italic max-w-2xl mx-auto">
            {bibleVerse}
            <span className="block mt-2 text-gold not-italic text-sm font-medium">
              {bibleReference}
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DonationsSection;
