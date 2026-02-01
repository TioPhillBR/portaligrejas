import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import PageTransition from "@/components/PageTransition";

const TermsOfService = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-lg sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <PortalLogo className="h-8 w-8" />
                <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
              </Link>
              <Button variant="ghost" asChild>
                <Link to="/" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Termos de Uso
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground">
                Ao acessar e usar o Portal Igrejas, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Descrição do Serviço</h2>
              <p className="text-muted-foreground">
                O Portal Igrejas é uma plataforma SaaS (Software como Serviço) que oferece ferramentas para igrejas 
                criarem e gerenciarem seus sites institucionais, incluindo funcionalidades como gestão de eventos, 
                ministérios, blog, galeria de fotos e comunicação com membros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Cadastro e Conta</h2>
              <p className="text-muted-foreground">
                Para utilizar nossos serviços, você deve criar uma conta fornecendo informações verdadeiras e completas. 
                Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Planos e Pagamentos</h2>
              <p className="text-muted-foreground">
                Os serviços são oferecidos através de planos mensais pagos. O pagamento é processado de forma segura 
                através de nosso parceiro de pagamentos. Em caso de não pagamento, o acesso aos serviços poderá ser 
                suspenso até a regularização.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Uso Aceitável</h2>
              <p className="text-muted-foreground">
                Você concorda em usar o serviço apenas para fins lícitos e de acordo com estes Termos. 
                É proibido usar a plataforma para disseminar conteúdo ilegal, ofensivo, difamatório ou que 
                viole direitos de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Propriedade Intelectual</h2>
              <p className="text-muted-foreground">
                Todo o conteúdo da plataforma, incluindo software, design, logotipos e textos, é propriedade 
                do Portal Igrejas e está protegido por leis de direitos autorais. O conteúdo criado pelos 
                usuários permanece de propriedade dos mesmos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Cancelamento</h2>
              <p className="text-muted-foreground">
                Você pode cancelar sua assinatura a qualquer momento através do painel administrativo. 
                O acesso permanecerá ativo até o fim do período já pago. Não há reembolso para períodos parciais.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Limitação de Responsabilidade</h2>
              <p className="text-muted-foreground">
                O Portal Igrejas não se responsabiliza por perdas ou danos indiretos, incidentais ou consequentes 
                decorrentes do uso ou impossibilidade de uso dos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Alterações nos Termos</h2>
              <p className="text-muted-foreground">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. As alterações entrarão em vigor 
                após a publicação nesta página. O uso contínuo dos serviços após as alterações constitui aceitação 
                dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Contato</h2>
              <p className="text-muted-foreground">
                Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do email: 
                <a href="mailto:suporte@portaligrejas.com" className="text-primary hover:underline ml-1">
                  suporte@portaligrejas.com
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default TermsOfService;
