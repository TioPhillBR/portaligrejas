import { useState, useEffect } from "react";
import { LogIn, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string, isRoute?: boolean) => {
    if (isRoute) {
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
        {/* Desktop: Logo on left */}
        <div className="hidden md:block">
          <Logo size={isScrolled ? "sm" : "md"} />
        </div>

        {/* Mobile: Centered Logo */}
        <div className="md:hidden flex-1 flex justify-center">
          <Logo size={isScrolled ? "sm" : "md"} />
        </div>

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

        {/* Desktop: Right side icons */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          
          {/* Unified Notification Bell for logged-in users */}
          {user && (
            <div className={cn(
              isScrolled
                ? "[&_button]:text-foreground [&_button]:hover:bg-accent/50"
                : "[&_button]:text-white/90 [&_button]:hover:text-white [&_button]:hover:bg-white/10"
            )}>
              <NotificationBell />
            </div>
          )}
          
          <Link to={user ? "/membro" : "/login"}>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "transition-colors",
                isScrolled
                  ? "text-foreground hover:bg-accent/50"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              )}
              aria-label={user ? "Área do Membro" : "Login"}
            >
              {user ? <User className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
            </Button>
          </Link>
          
          <Button
            onClick={() => scrollToSection("#contato")}
            className="hidden sm:flex btn-gold"
          >
            Quero Visitar
          </Button>
        </div>
      </div>

    </header>
  );
};

export default Header;
