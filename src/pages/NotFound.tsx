import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <PortalLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            {/* 404 Number */}
            <div className="relative mb-8">
              <h1 className="text-[120px] md:text-[180px] font-bold text-primary/10 leading-none select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full border border-border">
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    Página não encontrada
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-lg mb-8">
              Ops! A página que você está procurando não existe ou foi movida para outro endereço.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Ir para o início
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/igrejas">
                  <Search className="w-4 h-4" />
                  Buscar uma igreja
                </Link>
              </Button>
            </div>

            {/* Back button */}
            <button 
              onClick={() => window.history.back()} 
              className="mt-8 text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 mx-auto transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a página anterior
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Portal Igrejas. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default NotFound;
