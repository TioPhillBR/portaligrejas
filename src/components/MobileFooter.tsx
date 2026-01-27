import { useState, useEffect } from "react";
import { Home, Calendar, Users, BookOpen, Mail, Menu, X, LogIn, User, Church, Heart, Image, Radio, HandCoins, HandHeart } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
const mainNavItems = [
  { label: "Início", href: "#inicio", icon: Home, sectionId: "inicio" },
  { label: "Eventos", href: "#eventos", icon: Calendar, sectionId: "eventos" },
  { label: "Ministérios", href: "#ministerios", icon: Users, sectionId: "ministerios" },
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
  const [activeSection, setActiveSection] = useState<string>("inicio");
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lightImpact } = useHapticFeedback();

  // Track active section based on scroll position
  useEffect(() => {
    if (location.pathname !== "/") return;

    const handleScroll = () => {
      const sections = ["inicio", "cultos", "eventos", "ministerios", "quem-somos", "galeria", "video", "doacoes", "oracao", "contato"];
      const scrollPosition = window.scrollY + 150;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const scrollToSection = (href: string, isRoute?: boolean) => {
    lightImpact();
    
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

  const handleNavClick = () => {
    lightImpact();
  };

  const isActive = (item: typeof mainNavItems[0]) => {
    if (item.isRoute) {
      return location.pathname === item.href;
    }
    return location.pathname === "/" && activeSection === item.sectionId;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.footer 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-effect border-t border-border/50 safe-area-bottom"
    >
      <nav className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          
          return item.isRoute ? (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                to={item.href}
                onClick={handleNavClick}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                )}
              >
                <motion.div
                  animate={active ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  active && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ) : (
            <motion.div key={item.href} variants={itemVariants} className="relative">
              <button
                onClick={() => scrollToSection(item.href)}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary hover:bg-accent/50"
                )}
              >
                <motion.div
                  animate={active ? { scale: 1.1 } : { scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  active && "text-primary font-semibold"
                )}>
                  {item.label}
                </span>
              </button>
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Hamburger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={(open) => {
          if (open) lightImpact();
          setIsMenuOpen(open);
        }}>
          <SheetTrigger asChild>
            <motion.button 
              variants={itemVariants}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </motion.button>
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
    </motion.footer>
  );
};

export default MobileFooter;
