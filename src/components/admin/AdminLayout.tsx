import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  Image,
  Radio,
  MessageSquare,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  FileText,
  ExternalLink,
  Home,
  MessageCircle,
  BarChart3,
  Tag,
  Palette,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import ContextualTooltip from "./ContextualTooltip";
import WelcomeTutorialModal from "./WelcomeTutorialModal";

const getSidebarItems = (slug: string) => [
  { icon: LayoutDashboard, label: "Dashboard", href: `/${slug}/admin`, tutorialId: "dashboard" },
  { icon: BarChart3, label: "Analytics", href: `/${slug}/admin/analytics` },
  { icon: Home, label: "Seções da Home", href: `/${slug}/admin/secoes` },
  { icon: Clock, label: "Horários de Culto", href: `/${slug}/admin/horarios` },
  { icon: Calendar, label: "Eventos", href: `/${slug}/admin/eventos`, tutorialId: "events" },
  { icon: Users, label: "Ministérios", href: `/${slug}/admin/ministerios`, tutorialId: "ministries" },
  { icon: Image, label: "Galeria", href: `/${slug}/admin/galeria`, tutorialId: "gallery" },
  { icon: FileText, label: "Blog", href: `/${slug}/admin/blog` },
  { icon: BarChart3, label: "Estatísticas Blog", href: `/${slug}/admin/blog/estatisticas` },
  { icon: Users, label: "Categorias Blog", href: `/${slug}/admin/blog/categorias` },
  { icon: Tag, label: "Tags Blog", href: `/${slug}/admin/blog/tags` },
  { icon: MessageCircle, label: "Comentários", href: `/${slug}/admin/comentarios` },
  { icon: Radio, label: "Comunicação", href: `/${slug}/admin/comunicacao`, tutorialId: "broadcast" },
  { icon: MessageSquare, label: "Mensagens", href: `/${slug}/admin/mensagens`, tutorialId: "communication" },
  { icon: Heart, label: "Pedidos de Oração", href: `/${slug}/admin/oracoes` },
  { icon: Settings, label: "Configurações", href: `/${slug}/admin/configuracoes`, tutorialId: "settings" },
  { icon: Palette, label: "Temas", href: `/${slug}/admin/temas`, tutorialId: "themes" },
  { icon: Shield, label: "Usuários", href: `/${slug}/admin/usuarios` },
  { icon: CreditCard, label: "Assinatura", href: `/${slug}/admin/assinatura` },
  { icon: Receipt, label: "Faturas", href: `/${slug}/admin/faturas` },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const { user, loading, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
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
              {getSidebarItems(slug || '').map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href || 
                  (item.href === `/${slug}/admin` && location.pathname === `/${slug}/admin`);
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    data-tutorial={item.tutorialId}
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
              {/* Link to main site */}
              <a
                href={`/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors mt-4 border-t pt-4"
              >
                <ExternalLink className="w-5 h-5" />
                Ver Site
              </a>
            </nav>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-2">
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

      {/* Contextual Tooltips */}
      <ContextualTooltip />

      {/* Welcome Tutorial Modal - First Access */}
      <WelcomeTutorialModal churchSlug={slug} />
    </div>
  );
};

export default AdminLayout;
