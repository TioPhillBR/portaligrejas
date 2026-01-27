import { Home, User, Calendar, Users, MessageCircle, Bell, Menu, Search, Send, LogOut, Settings } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

const mainNavItems = [
  { label: "Início", href: "/membro", icon: Home },
  { label: "Eventos", href: "/membro/eventos", icon: Calendar },
  { label: "Grupos", href: "/membro/grupos", icon: MessageCircle },
  { label: "Avisos", href: "/membro/avisos", icon: Bell },
];

const allNavItems = [
  { label: "Início", href: "/membro", icon: Home },
  { label: "Meu Perfil", href: "/membro/perfil", icon: User },
  { label: "Eventos", href: "/membro/eventos", icon: Calendar },
  { label: "Ministérios", href: "/membro/ministerios", icon: Users },
  { label: "Grupos", href: "/membro/grupos", icon: MessageCircle },
  { label: "Mensagens", href: "/membro/mensagens", icon: Send },
  { label: "Buscar Membros", href: "/membro/buscar", icon: Search },
  { label: "Avisos", href: "/membro/avisos", icon: Bell },
];

const MemberMobileFooter = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/membro") {
      return location.pathname === "/membro";
    }
    return location.pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-effect border-t border-border/50 safe-area-bottom"
    >
      <nav className="flex items-center justify-around py-2 px-2">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <motion.div key={item.href} variants={itemVariants} className="relative">
              <Link
                to={item.href}
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
              </Link>
              {active && (
                <motion.div
                  layoutId="memberActiveIndicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.div>
          );
        })}

        {/* Menu hamburger */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <motion.button 
              variants={itemVariants}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
            >
              <Menu className="h-5 w-5" />
              <span className="text-[10px] font-medium">Menu</span>
            </motion.button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] rounded-t-3xl">
            <SheetHeader className="pb-4 border-b border-border">
              <SheetTitle className="text-lg">Menu do Membro</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-1 py-4 overflow-y-auto max-h-[calc(75vh-120px)]">
              {/* Navigation links */}
              <div className="space-y-1">
                {allNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                        active 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="border-t border-border my-3" />

              {/* Theme toggle */}
              <div className="flex items-center justify-between px-4 py-3 bg-accent/30 rounded-lg">
                <span className="font-medium">Tema</span>
                <ThemeToggle />
              </div>

              {/* Return to site */}
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent/50 transition-colors"
              >
                <Home className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Voltar ao Site</span>
              </Link>

              {/* Sign out */}
              <Button
                variant="outline"
                className="mx-4 mt-2 gap-2"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
                Sair da Conta
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </motion.footer>
  );
};

export default MemberMobileFooter;
