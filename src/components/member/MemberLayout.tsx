import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import {
  Home,
  User,
  Users,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Send,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const sidebarItems = [
  { icon: Home, label: "Início", href: "/membro" },
  { icon: User, label: "Meu Perfil", href: "/membro/perfil" },
  { icon: Calendar, label: "Eventos", href: "/membro/eventos" },
  { icon: Users, label: "Ministérios", href: "/membro/ministerios" },
  { icon: MessageCircle, label: "Grupos", href: "/membro/grupos" },
  { icon: Send, label: "Mensagens", href: "/membro/mensagens" },
  { icon: Search, label: "Buscar Membros", href: "/membro/buscar" },
  { icon: Bell, label: "Avisos", href: "/membro/avisos" },
];

const MemberLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data } = await supabase.rpc("has_any_admin_role", { _user_id: user.id });
        setIsAdmin(!!data);
      }
    };
    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sidebar Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
            {isAdmin && (
              <Button
                variant="outline"
                className="w-full gap-2 mb-2"
                onClick={() => navigate("/admin")}
              >
                <Settings className="w-4 h-4" />
                Painel Admin
              </Button>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">
                {user.email}
              </span>
              <ThemeToggle />
            </div>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <Logo size="sm" showText={false} />
          <ThemeToggle />
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MemberLayout;
