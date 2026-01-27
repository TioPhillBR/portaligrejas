import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Pastor João Silva",
    church: "Igreja Batista Central",
    avatar: "JS",
    content:
      "O Portal Igrejas transformou nossa comunicação. Em poucos minutos tínhamos um site profissional funcionando. Nossa comunidade ficou mais conectada.",
    rating: 5,
  },
  {
    name: "Pastora Maria Santos",
    church: "Comunidade da Fé",
    avatar: "MS",
    content:
      "A facilidade de uso é impressionante. Não precisamos de conhecimento técnico para gerenciar eventos, blog e a área dos membros. Recomendo!",
    rating: 5,
  },
  {
    name: "Pr. Carlos Oliveira",
    church: "Igreja Presbiteriana Renovada",
    avatar: "CO",
    content:
      "O suporte é excelente e os recursos atendem perfeitamente nossas necessidades. O melhor investimento que fizemos para nossa presença online.",
    rating: 5,
  },
];

export const Testimonials = () => {
  return (
    <section id="depoimentos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            O que dizem sobre nós
          </h2>
          <p className="text-lg text-muted-foreground">
            Igrejas de todo o Brasil já estão usando o Portal Igrejas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-foreground mb-6 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
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
