import { Globe, Palette, Share2 } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: Globe,
    title: "Escolha o nome do seu site",
    description: "Digite o endereço desejado (ex: portaligrejas.com.br/igrejaviva) e verifique a disponibilidade.",
  },
  {
    number: "2",
    icon: Palette,
    title: "Personalize com logo, textos e imagens",
    description: "Use nosso painel intuitivo para adicionar sua identidade visual e conteúdos da igreja.",
  },
  {
    number: "3",
    icon: Share2,
    title: "Publique e compartilhe",
    description: "Seu site estará no ar instantaneamente. Compartilhe com sua comunidade e cresça online.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="como-funciona" className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Crie seu site em 3 passos simples
          </h2>
          <p className="text-lg text-muted-foreground">
            Sem complicação, sem conhecimento técnico necessário.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line (hidden on mobile, visible on md+) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                )}
                
                <div className="flex flex-col items-center text-center">
                  {/* Number badge */}
                  <div className="relative mb-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <step.icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-xs">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Final message */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-lg sm:text-xl text-primary font-medium">
              ✨ Tudo isso sem precisar saber programar!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
