import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PortalLogo } from "@/components/PortalLogo";
import { LandingHero } from "@/components/landing/LandingHero";
import { Features } from "@/components/landing/Features";
import { TemplateDemo } from "@/components/landing/TemplateDemo";
import { PricingCards } from "@/components/landing/PricingCards";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Menu, X } from "lucide-react";

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "#recursos", label: "Recursos" },
    { href: "#como-funciona", label: "Como Funciona" },
    { href: "#precos", label: "Preços" },
    { href: "#depoimentos", label: "Depoimentos" },
    { href: "#faq", label: "FAQ" },
  ];

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
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild>
                <Link to="/criar-igreja">Criar meu site</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/criar-igreja">Criar meu site</Link>
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
        <TemplateDemo />
        <PricingCards />
        <HowItWorks />
        <Testimonials />
        <FAQ />
      </main>

      <LandingFooter />
    </div>
  );
};

export default LandingPage;
