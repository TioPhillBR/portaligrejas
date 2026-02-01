import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import PageTransition from "@/components/PageTransition";

const PrivacyPolicy = () => {
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
            Política de Privacidade
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Introdução</h2>
              <p className="text-muted-foreground">
                O Portal Igrejas está comprometido em proteger sua privacidade. Esta política descreve como 
                coletamos, usamos, armazenamos e protegemos suas informações pessoais em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Dados que Coletamos</h2>
              <p className="text-muted-foreground">Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li><strong>Dados de cadastro:</strong> nome, email, telefone, data de nascimento</li>
                <li><strong>Dados da igreja:</strong> nome, endereço, informações de contato</li>
                <li><strong>Dados de uso:</strong> páginas visitadas, funcionalidades utilizadas, tempo de acesso</li>
                <li><strong>Dados de pagamento:</strong> processados por nosso parceiro de pagamentos (não armazenamos dados de cartão)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Como Usamos seus Dados</h2>
              <p className="text-muted-foreground">Utilizamos seus dados para:</p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações importantes sobre o serviço</li>
                <li>Personalizar sua experiência na plataforma</li>
                <li>Cumprir obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground">
                Não vendemos seus dados pessoais. Compartilhamos informações apenas com:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li><strong>Processadores de pagamento:</strong> para efetuar transações</li>
                <li><strong>Provedores de infraestrutura:</strong> para hospedar nossos serviços</li>
                <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
                <li>Criptografia de senhas com algoritmos seguros</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Backups regulares e seguros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Confirmar a existência de tratamento de seus dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>Solicitar a portabilidade dos dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground">
                Mantemos seus dados enquanto sua conta estiver ativa ou conforme necessário para fornecer 
                nossos serviços. Após o cancelamento, seus dados serão mantidos por até 5 anos para 
                cumprimento de obrigações legais, após o que serão excluídos ou anonimizados.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para o funcionamento da plataforma. Para mais informações, 
                consulte nossa <Link to="/cookies" className="text-primary hover:underline">Política de Cookies</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Alterações nesta Política</h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas 
                por email ou através de um aviso em nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Contato</h2>
              <p className="text-muted-foreground">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>Email:</strong>{" "}
                <a href="mailto:privacidade@portaligrejas.com" className="text-primary hover:underline">
                  privacidade@portaligrejas.com
                </a>
              </p>
            </section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;
