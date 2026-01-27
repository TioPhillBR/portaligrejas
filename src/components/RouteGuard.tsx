import { useEffect, useState, forwardRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Reserved routes that should not be treated as church slugs
const RESERVED_ROUTES = [
  'criar-igreja',
  'login', 
  'cadastro',
  'setup',
  'admin',
  'membro',
  'plataforma',
  'api',
  'termos',
  'privacidade',
  'cookies',
  'ajuda',
  'suporte',
  'contato',
  'precos',
  'planos',
  'checkout',
  'igrejas',
];

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard = forwardRef<HTMLDivElement, RouteGuardProps>(({ children }, ref) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!slug) {
      setIsValid(true);
      return;
    }

    // Check if this is a reserved route
    if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
      // The route system should handle this, but just in case
      setIsValid(false);
      return;
    }

    // Check if the slug exists as a church
    checkChurchExists(slug);
  }, [slug]);

  const checkChurchExists = async (churchSlug: string) => {
    try {
      const { data, error } = await supabase
        .from("churches")
        .select("id, status")
        .eq("slug", churchSlug)
        .maybeSingle();

      if (error) {
        console.error("Error checking church:", error);
        setIsValid(false);
        return;
      }

      if (!data) {
        // Church doesn't exist, redirect to 404
        navigate("/404", { replace: true });
        setIsValid(false);
        return;
      }

      if (data.status !== "active") {
        // Church is not active
        navigate("/404", { replace: true });
        setIsValid(false);
        return;
      }

      setIsValid(true);
    } catch (error) {
      console.error("Error checking church:", error);
      setIsValid(false);
    }
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isValid) {
    return null;
  }

  return <div ref={ref}>{children}</div>;
});

RouteGuard.displayName = "RouteGuard";

export default RouteGuard;
