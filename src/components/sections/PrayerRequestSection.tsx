import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Heart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const PrayerRequestSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [prayerRequest, setPrayerRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerRequest.trim()) return;

    setIsSubmitting(true);
    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Pedido de oração enviado!",
      description: "Nossa equipe de intercessores estará orando por você.",
    });

    setPrayerRequest("");
    setIsSubmitting(false);
  };

  return (
    <section id="pedido-oracao" className="section-padding" ref={ref}>
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                    Pedido de Oração
                  </h2>
                  <p className="text-muted-foreground">
                    Compartilhe seu pedido conosco. Nossa equipe de intercessores
                    estará orando por você. Seu pedido é confidencial.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    value={prayerRequest}
                    onChange={(e) => setPrayerRequest(e.target.value)}
                    placeholder="Escreva aqui o seu pedido de oração..."
                    rows={5}
                    className="resize-none bg-background"
                    required
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    ✦ Seu pedido é anônimo e confidencial ✦
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Enviar Pedido de Oração
                      </>
                    )}
                  </Button>
                </form>

                {/* Bible Verse */}
                <p className="text-center text-sm text-muted-foreground mt-6 italic">
                  "Confessai as vossas culpas uns aos outros, e orai uns pelos
                  outros, para que sareis." - Tiago 5:16
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PrayerRequestSection;
