import { Link } from "react-router-dom";
import { PortalLogo } from "@/components/PortalLogo";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <PortalLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              A plataforma mais fácil para criar e gerenciar o site da sua igreja.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <a href="#recursos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#precos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Preços
                </a>
              </li>
              <li>
                <a href="#depoimentos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Depoimentos
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Contato
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Status do Sistema
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-muted-foreground text-sm">
            © {currentYear} Portal Igrejas. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
