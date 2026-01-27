import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Pr. João",
    church: "Igreja Vida Plena (SP)",
    avatar: "JP",
    content:
      "Agora temos um site lindo e recebemos doações online. Foi um divisor de águas para nossa igreja!",
    rating: 5,
  },
  {
    name: "Pastora Ana",
    church: "Ministério Luz do Mundo (MG)",
    avatar: "PA",
    content:
      "Fácil de usar, rápido de publicar. Nossa agenda de cultos está sempre atualizada e os membros adoraram.",
    rating: 5,
  },
  {
    name: "Pr. Carlos Oliveira",
    church: "Igreja Presbiteriana Renovada (RJ)",
    avatar: "CO",
    content:
      "O suporte é excelente e os recursos atendem perfeitamente nossas necessidades. Recomendo a todas as igrejas!",
    rating: 5,
  },
  {
    name: "Missionária Ruth",
    church: "Igreja Batista Nova Vida (BA)",
    avatar: "MR",
    content:
      "Conseguimos organizar nossos ministérios e a comunicação melhorou muito. O chat de ministérios é fantástico!",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="depoimentos" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Igrejas que já confiam no Portal Igrejas
          </h2>
          <p className="text-lg text-muted-foreground">
            Veja o que pastores e líderes estão dizendo sobre nossa plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6 relative"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
              
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-foreground mb-6 text-sm sm:text-base leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">
                    {testimonial.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {testimonial.church}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
