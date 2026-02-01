import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import PageTransition from "@/components/PageTransition";

const CookiesPolicy = () => {
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
            Política de Cookies
          </h1>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">O que são Cookies?</h2>
              <p className="text-muted-foreground">
                Cookies são pequenos arquivos de texto armazenados em seu navegador quando você visita um site. 
                Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer 
                informações aos proprietários do site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Como Usamos Cookies</h2>
              <p className="text-muted-foreground">
                O Portal Igrejas utiliza cookies para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Manter você conectado à sua conta</li>
                <li>Lembrar suas preferências de configuração</li>
                <li>Melhorar a segurança da plataforma</li>
                <li>Analisar como o site é utilizado para melhorias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Tipos de Cookies que Utilizamos</h2>
              
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies Essenciais</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Necessários para o funcionamento básico do site. Incluem cookies de autenticação e sessão. 
                    Não podem ser desativados.
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies de Preferências</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Armazenam suas preferências, como tema claro/escuro e idioma preferido.
                  </p>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold text-foreground">Cookies de Análise</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Ajudam a entender como os visitantes interagem com o site, permitindo melhorias contínuas.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Cookies de Terceiros</h2>
              <p className="text-muted-foreground">
                Alguns cookies são colocados por serviços de terceiros que aparecem em nossas páginas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li><strong>Supabase:</strong> Para autenticação e gerenciamento de sessão</li>
                <li><strong>Serviços de análise:</strong> Para entender o uso do site (anonimizados)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Como Gerenciar Cookies</h2>
              <p className="text-muted-foreground">
                Você pode controlar e/ou excluir cookies conforme desejar. A maioria dos navegadores permite:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Ver quais cookies estão armazenados e excluí-los individualmente</li>
                <li>Bloquear cookies de terceiros</li>
                <li>Bloquear todos os cookies de sites específicos</li>
                <li>Bloquear todos os cookies</li>
                <li>Excluir todos os cookies ao fechar o navegador</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Atenção:</strong> Bloquear cookies essenciais pode impedir o funcionamento correto da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">LocalStorage</h2>
              <p className="text-muted-foreground">
                Além de cookies, utilizamos o LocalStorage do navegador para armazenar:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-2">
                <li>Preferência de tema (claro/escuro)</li>
                <li>Dados temporários do processo de cadastro</li>
                <li>Configurações de exibição</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Atualizações desta Política</h2>
              <p className="text-muted-foreground">
                Esta política pode ser atualizada periodicamente. Recomendamos que você revise esta página 
                ocasionalmente para se manter informado sobre como usamos cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contato</h2>
              <p className="text-muted-foreground">
                Se você tiver dúvidas sobre nossa política de cookies, entre em contato:
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

export default CookiesPolicy;
