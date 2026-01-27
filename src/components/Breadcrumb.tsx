import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Auto-generate breadcrumb from route if items not provided
const routeLabels: Record<string, string> = {
  blog: "Blog",
  eventos: "Eventos",
  ministerios: "Ministérios",
  admin: "Administração",
  secoes: "Seções da Home",
  horarios: "Horários de Culto",
  galeria: "Galeria",
  comunicacao: "Comunicação",
  mensagens: "Mensagens",
  oracoes: "Pedidos de Oração",
  configuracoes: "Configurações",
  temas: "Temas",
  usuarios: "Usuários",
  estatisticas: "Estatísticas",
  categorias: "Categorias",
  tags: "Tags",
  comentarios: "Comentários",
};

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const location = useLocation();
  
  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || (() => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const generatedItems: BreadcrumbItem[] = [];
    
    let currentPath = "";
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      const label = routeLabels[part] || part.charAt(0).toUpperCase() + part.slice(1);
      
      // Don't add link for the last item (current page)
      if (index === pathParts.length - 1) {
        generatedItems.push({ label });
      } else {
        generatedItems.push({ label, href: currentPath });
      }
    });
    
    return generatedItems;
  })();

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center text-sm text-muted-foreground mb-4", className)}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        <li>
          <Link 
            to="/" 
            className="flex items-center hover:text-foreground transition-colors"
            aria-label="Página inicial"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {item.href ? (
              <Link 
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;