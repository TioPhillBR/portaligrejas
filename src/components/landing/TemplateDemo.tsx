import { Button } from "@/components/ui/button";
import { ExternalLink, Smartphone, Monitor, Calendar, Users, MessageSquare, Mail } from "lucide-react";

export const TemplateDemo = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Design moderno e pensado para igrejas evangélicas
          </h2>
          <p className="text-lg text-muted-foreground">
            Seu site será bonito, funcional e adaptado para celular, com seções específicas para sua missão.
          </p>
        </div>

        {/* Mockup area */}
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl p-6 sm:p-8 lg:p-12 border border-border">
            {/* Desktop + Mobile mockup */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Desktop mockup */}
              <div className="relative w-full max-w-2xl">
                <div className="bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
                  {/* Browser header */}
                  <div className="flex items-center gap-2 p-3 bg-muted/50 border-b border-border">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-background rounded-md px-4 py-1 text-xs text-muted-foreground flex items-center gap-2">
                        <Monitor className="w-3 h-3" />
                        portaligrejas.com.br/sua-igreja
                      </div>
                    </div>
                  </div>
                  
                  {/* Content preview */}
                  <div className="p-6 space-y-4">
                    {/* Hero section mock */}
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-6 text-center">
                      <div className="w-16 h-16 bg-primary/30 rounded-full mx-auto mb-3" />
                      <div className="h-4 bg-foreground/20 rounded w-2/3 mx-auto mb-2" />
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/2 mx-auto" />
                    </div>
                    
                    {/* Feature highlights */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <span className="text-xs text-muted-foreground">Cultos</span>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <span className="text-xs text-muted-foreground">Ministérios</span>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <MessageSquare className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <span className="text-xs text-muted-foreground">Mensagens</span>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <Mail className="w-5 h-5 mx-auto mb-1 text-primary" />
                        <span className="text-xs text-muted-foreground">Contato</span>
                      </div>
                    </div>
                    
                    {/* Content blocks */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="h-20 bg-muted/50 rounded mb-2" />
                        <div className="h-3 bg-foreground/15 rounded w-3/4 mb-1" />
                        <div className="h-2 bg-muted-foreground/15 rounded w-1/2" />
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="h-20 bg-muted/50 rounded mb-2" />
                        <div className="h-3 bg-foreground/15 rounded w-3/4 mb-1" />
                        <div className="h-2 bg-muted-foreground/15 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile mockup */}
              <div className="relative hidden lg:block">
                <div className="w-48 bg-card rounded-3xl shadow-2xl border-4 border-foreground/10 overflow-hidden">
                  {/* Phone notch */}
                  <div className="h-6 bg-foreground/10 flex items-center justify-center">
                    <div className="w-16 h-4 bg-foreground/20 rounded-full" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 space-y-2">
                    <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg p-3 text-center">
                      <div className="w-8 h-8 bg-primary/30 rounded-full mx-auto mb-2" />
                      <div className="h-2 bg-foreground/20 rounded w-2/3 mx-auto" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Smartphone className="w-3 h-3 mx-auto text-primary" />
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <Calendar className="w-3 h-3 mx-auto text-primary" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="bg-muted/30 rounded p-2">
                        <div className="h-10 bg-muted/50 rounded mb-1" />
                        <div className="h-1.5 bg-foreground/15 rounded w-3/4" />
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <div className="h-10 bg-muted/50 rounded mb-1" />
                        <div className="h-1.5 bg-foreground/15 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Home indicator */}
                  <div className="h-6 flex items-center justify-center">
                    <div className="w-20 h-1 bg-foreground/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-8 sm:mt-12">
              <Button size="lg" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Ver exemplo de site ao vivo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
