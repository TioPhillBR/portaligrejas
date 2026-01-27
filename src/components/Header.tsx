import { useState, useEffect } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Início", href: "#inicio" },
  { label: "Cultos", href: "#cultos" },
  { label: "Eventos", href: "#eventos" },
  { label: "Ministérios", href: "#ministerios" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Galeria", href: "#galeria" },
  { label: "Blog", href: "/blog", isRoute: true },
  { label: "Contato", href: "#contato" },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      setIsMobileMenuOpen(false);
      return;
    }

    // If we're on the homepage, scroll directly
    if (location.pathname === "/") {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Navigate to homepage with anchor
      navigate("/" + href);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "glass-effect shadow-md py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container-custom flex items-center justify-between">
        <Logo size={isScrolled ? "sm" : "md"} />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isScrolled
                    ? "text-foreground hover:bg-accent/50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.href}
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isScrolled
                    ? "text-foreground hover:bg-accent/50"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </button>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Link to="/login">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                isScrolled
                  ? "text-foreground hover:bg-accent/50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
              aria-label="Login"
            >
              <LogIn className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button
            onClick={() => scrollToSection("#contato")}
            className="hidden sm:flex btn-gold"
          >
            Quero Visitar
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="lg:hidden absolute top-full left-0 right-0 glass-effect shadow-lg animate-fade-in">
          <div className="container-custom py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-left rounded-lg text-foreground font-medium hover:bg-accent/50 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.href}
                  onClick={() => scrollToSection(item.href)}
                  className="px-4 py-3 text-left rounded-lg text-foreground font-medium hover:bg-accent/50 transition-colors"
                >
                  {item.label}
                </button>
              )
            ))}
            <Button
              onClick={() => scrollToSection("#contato")}
              className="mt-2 btn-gold w-full"
            >
              Quero Visitar
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
