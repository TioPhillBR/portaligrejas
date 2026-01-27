import { useState } from "react";
import { Home, Calendar, Users, BookOpen, Mail, Menu, X, LogIn, User, Church, Heart, Image, Radio, HandCoins, HandHeart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { label: "Início", href: "#inicio", icon: Home },
  { label: "Eventos", href: "#eventos", icon: Calendar },
  { label: "Ministérios", href: "#ministerios", icon: Users },
  { label: "Blog", href: "/blog", icon: BookOpen, isRoute: true },
];

const allNavItems = [
  { label: "Início", href: "#inicio", icon: Home },
  { label: "Cultos", href: "#cultos", icon: Church },
  { label: "Eventos", href: "#eventos", icon: Calendar },
  { label: "Ministérios", href: "#ministerios", icon: Users },
  { label: "Quem Somos", href: "#quem-somos", icon: Heart },
  { label: "Galeria", href: "#galeria", icon: Image },
  { label: "Vídeo", href: "#video", icon: Radio },
  { label: "Doações", href: "#doacoes", icon: HandCoins },
  { label: "Oração", href: "#oracao", icon: HandHeart },
  { label: "Blog", href: "/blog", icon: BookOpen, isRoute: true },
  { label: "Contato", href: "#contato", icon: Mail },
];

const MobileFooter = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (href: string, isRoute?: boolean) => {
    if (isRoute) {
      setIsMenuOpen(false);
      return;
    }

    if (location.pathname === "/") {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/" + href);
    }
    setIsMenuOpen(false);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-effect border-t border-border/50 safe-area-bottom">
      <nav className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          return item.isRoute ? (
            <Link
              key={item.href}
              to={item.href}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ) : (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Hamburger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors">
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-lg">Menu</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-1 py-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              {/* User actions */}
              <div className="flex items-center justify-between px-4 py-3 mb-2 bg-accent/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {user ? (
                    <>
                      <User className="h-5 w-5 text-primary" />
                      <span className="font-medium">Área do Membro</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 text-primary" />
                      <span className="font-medium">Entrar / Cadastrar</span>
                    </>
                  )}
                </div>
                <Link 
                  to={user ? "/membro" : "/login"} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-sm text-primary font-medium"
                >
                  Acessar
                </Link>
              </div>

              {/* Notifications for logged users */}
              {user && (
                <div className="flex items-center justify-between px-4 py-3 mb-2 bg-accent/30 rounded-lg">
                  <span className="font-medium">Notificações</span>
                  <NotificationBell />
                </div>
              )}

              {/* Theme toggle */}
              <div className="flex items-center justify-between px-4 py-3 mb-2 bg-accent/30 rounded-lg">
                <span className="font-medium">Tema</span>
                <ThemeToggle />
              </div>

              {/* Navigation links */}
              <div className="mt-2">
                <p className="text-xs text-muted-foreground uppercase font-semibold px-4 mb-2">Navegação</p>
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  return item.isRoute ? (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      key={item.href}
                      onClick={() => scrollToSection(item.href)}
                      className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* CTA Button */}
              <div className="mt-4 px-4">
                <Button
                  onClick={() => scrollToSection("#contato")}
                  className="w-full btn-gold"
                >
                  Quero Visitar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </footer>
  );
};

export default MobileFooter;
