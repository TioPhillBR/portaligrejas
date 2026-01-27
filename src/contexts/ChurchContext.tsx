import { createContext, useContext, useEffect, useState, ReactNode, forwardRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Church {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  website: string | null;
  social_links: Record<string, string>;
  plan: string;
  status: string;
  settings: Record<string, any>;
  theme_settings: Record<string, any>;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
  pro_rata_credit?: number;
  current_period_start?: string;
  current_period_end?: string;
  payment_overdue_at?: string;
  asaas_subscription_id?: string;
  asaas_customer_id?: string;
}

interface ChurchMember {
  id: string;
  church_id: string;
  user_id: string;
  role: "owner" | "admin" | "moderator" | "member";
  is_active: boolean;
  joined_at: string;
}

interface ChurchContextType {
  church: Church | null;
  membership: ChurchMember | null;
  loading: boolean;
  error: string | null;
  isOwner: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isMember: boolean;
  refetch: () => Promise<void>;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

interface ChurchProviderProps {
  children: ReactNode;
  slug?: string;
}

export const ChurchProvider = forwardRef<HTMLDivElement, ChurchProviderProps>(
  ({ children, slug: propSlug }, ref) => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const { user } = useAuth();
  
  const [church, setChurch] = useState<Church | null>(null);
  const [membership, setMembership] = useState<ChurchMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChurch = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch church data
      const { data: churchData, error: churchError } = await supabase
        .from("churches")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (churchError) throw churchError;

      if (!churchData) {
        setError("Igreja não encontrada");
        setChurch(null);
        setMembership(null);
        setLoading(false);
        return;
      }

      setChurch(churchData as Church);

      // If user is logged in, check membership
      if (user) {
        const { data: memberData, error: memberError } = await supabase
          .from("church_members")
          .select("*")
          .eq("church_id", churchData.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!memberError && memberData) {
          setMembership(memberData as ChurchMember);
        } else {
          setMembership(null);
        }
      } else {
        setMembership(null);
      }
    } catch (err: any) {
      console.error("Error fetching church:", err);
      setError(err.message || "Erro ao carregar igreja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChurch();
  }, [slug, user?.id]);

  const isOwner = membership?.role === "owner";
  const isAdmin = membership?.role === "owner" || membership?.role === "admin";
  const isModerator = isAdmin || membership?.role === "moderator";
  const isMember = membership?.is_active === true;

  return (
    <ChurchContext.Provider
      value={{
        church,
        membership,
        loading,
        error,
        isOwner,
        isAdmin,
        isModerator,
        isMember,
        refetch: fetchChurch,
      }}
    >
      <div ref={ref}>{children}</div>
    </ChurchContext.Provider>
  );
});

ChurchProvider.displayName = "ChurchProvider";

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (context === undefined) {
    throw new Error("useChurch must be used within a ChurchProvider");
  }
  return context;
};

// Hook to get church data without requiring provider (for optional use)
export const useChurchData = (slug: string | undefined) => {
  const [church, setChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChurch = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("churches")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (fetchError) throw fetchError;
        setChurch(data as Church | null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChurch();
  }, [slug]);

  return { church, loading, error };
};
