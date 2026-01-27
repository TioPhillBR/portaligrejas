import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import PageTransition from "@/components/PageTransition";

const ONBOARDING_COMPLETED_KEY = "onboarding_completed";

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [churchSlug, setChurchSlug] = useState<string>("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      checkOwnership();
    }
  }, [user, loading, slug]);

  const checkOwnership = async () => {
    try {
      // If slug is provided, check ownership for that church
      if (slug) {
        const { data: church } = await supabase
          .from("churches")
          .select("id, slug, owner_id")
          .eq("slug", slug)
          .single();

        if (church && church.owner_id === user?.id) {
          setIsOwner(true);
          setChurchSlug(church.slug);
        } else {
          // Not owner, redirect to church admin
          navigate(`/${slug}/admin`);
          return;
        }
      } else {
        // No slug, find user's church
        const { data: churches } = await supabase
          .from("churches")
          .select("id, slug")
          .eq("owner_id", user?.id)
          .limit(1);

        if (churches && churches.length > 0) {
          setIsOwner(true);
          setChurchSlug(churches[0].slug);
        } else {
          // No church found, redirect to create
          navigate("/criar-igreja");
          return;
        }
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleComplete = async () => {
    // Mark onboarding as completed in localStorage
    const completedKey = `${ONBOARDING_COMPLETED_KEY}_${churchSlug}`;
    localStorage.setItem(completedKey, "true");

    // Navigate to admin dashboard
    navigate(`/${churchSlug}/admin`);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <PageTransition>
      <OnboardingTutorial churchSlug={churchSlug} onComplete={handleComplete} />
    </PageTransition>
  );
};

export default OnboardingPage;
