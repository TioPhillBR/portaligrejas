import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import { LandingHero } from "@/components/landing/LandingHero";
import { Features } from "@/components/landing/Features";
import { PricingCards } from "@/components/landing/PricingCards";
import { Testimonials } from "@/components/landing/Testimonials";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Menu, X } from "lucide-react";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <PortalLogo className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </a>
              <a href="#depoimentos" className="text-muted-foreground hover:text-foreground transition-colors">
                Depoimentos
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/criar-igreja">Criar Igreja</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a
                href="#recursos"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Recursos
              </a>
              <a
                href="#precos"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Preços
              </a>
              <a
                href="#depoimentos"
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Depoimentos
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/criar-igreja">Criar Igreja</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        <LandingHero />
        <Features />
        <PricingCards />
        <Testimonials />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
