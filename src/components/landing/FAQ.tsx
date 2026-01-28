import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso saber programar?",
    answer:
      "Não. A plataforma é 100% visual e fácil de usar. Você gerencia tudo através de um painel administrativo intuitivo, sem precisar escrever uma única linha de código.",
  },
  {
    question: "Posso usar meu domínio próprio?",
    answer:
      "Sim. Você pode usar um domínio personalizado (ex: www.suaigreja.com.br) ou manter o endereço gratuito portaligrejas.com.br/nomedaigreja. A configuração é simples e nossa equipe pode ajudar.",
  },
  {
    question: "O site funciona no celular?",
    answer:
      "Sim! Seu site será 100% responsivo, funcionando perfeitamente em qualquer dispositivo: smartphones, tablets e computadores. A maioria dos acessos hoje vem de celulares, e seu site estará preparado.",
  },
  {
    question: "Posso cancelar quando quiser?",
    answer:
      "Sim. Não há fidelidade ou multa de cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente no painel. Seu site permanecerá ativo até o final do período pago.",
  },
  {
    question: "Tem suporte técnico?",
    answer:
      "Sim! Nossa equipe está disponível por WhatsApp e e-mail para te ajudar com dúvidas, configurações e qualquer problema técnico. No plano Diamante, você tem suporte prioritário.",
  },
  {
    question: "Como funciona o pagamento?",
    answer:
      "O pagamento é mensal, via cartão de crédito ou PIX. Você pode trocar de plano a qualquer momento, fazendo upgrade ou downgrade conforme a necessidade da sua igreja.",
  },
  {
    question: "Quantos membros posso cadastrar?",
    answer:
      "Todos os planos permitem membros ilimitados! Não há limite de pessoas que podem acessar a área do membro ou participar dos ministérios.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Utilizamos criptografia SSL em todo o site, backups automáticos diários e seguimos as melhores práticas de segurança. Seus dados e os dados da sua igreja estão protegidos.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Dúvidas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Encontre respostas para as perguntas mais comuns sobre nossa plataforma.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline py-5 text-base sm:text-lg font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
