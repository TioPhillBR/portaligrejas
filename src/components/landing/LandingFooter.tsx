import { Link } from "react-router-dom";
import { PortalLogo } from "@/components/PortalLogo";
import { Mail, MessageCircle, Instagram, Youtube, Shield, Lock } from "lucide-react";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <PortalLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              A plataforma mais fácil para criar e gerenciar o site da sua igreja.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/portaligrejas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@portaligrejas"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              <li>
                <a href="#recursos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Como Funciona
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
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:suporte@portaligrejas.com"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  E-mail
                </a>
              </li>
              <li>
                <Link to="/ajuda" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/termos" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm text-center sm:text-left">
              © {currentYear} Portal Igrejas. Todos os direitos reservados.
            </p>
            
            {/* Security badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Lock className="w-4 h-4 text-green-500" />
                <span>SSL Seguro</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Pagamento Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
