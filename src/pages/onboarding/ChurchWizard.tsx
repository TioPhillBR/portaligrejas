import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PortalLogo } from "@/components/PortalLogo";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import WizardStepIndicator from "@/components/onboarding/WizardStepIndicator";
import WizardStepAuth from "@/components/onboarding/WizardStepAuth";
import WizardStepPlan from "@/components/onboarding/WizardStepPlan";
import WizardStepChurch from "@/components/onboarding/WizardStepChurch";
import WizardStepCheckout from "@/components/onboarding/WizardStepCheckout";

export interface ChurchFormData {
  churchName: string;
  slug: string;
  email: string;
  phone: string;
  description: string;
}

export interface AuthFormData {
  userName: string;
  userEmail: string;
  userPassword: string;
  confirmPassword: string;
}

const STORAGE_KEY = "church_wizard_data";

const ChurchWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grantedAccount, setGrantedAccount] = useState<{
    hasGrantedAccount: boolean;
    plan?: string;
    expiresAt?: string;
  } | null>(null);

  // Form data with persistence
  const [churchData, setChurchData] = useState<ChurchFormData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.churchData || {
        churchName: "",
        slug: searchParams.get("slug") || "",
        email: "",
        phone: "",
        description: "",
      };
    }
    return {
      churchName: "",
      slug: searchParams.get("slug") || "",
      email: "",
      phone: "",
      description: "",
    };
  });

  const [authData, setAuthData] = useState<AuthFormData>({
    userName: "",
    userEmail: "",
    userPassword: "",
    confirmPassword: "",
  });

  // Persist data on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      churchData, 
      selectedPlan,
      currentStep: user ? currentStep : currentStep 
    }));
  }, [churchData, selectedPlan, currentStep, user]);

  // Handle recovery mode (user coming back from failed payment)
  useEffect(() => {
    const isRecovery = searchParams.get("recovery") === "true";
    const pendingChurchId = localStorage.getItem("pending_church_id");
    
    if (isRecovery && pendingChurchId && user) {
      // User is returning from cancelled payment, stay on checkout step
      const savedPlan = localStorage.getItem("pending_plan");
      if (savedPlan) {
        setSelectedPlan(savedPlan);
        setCurrentStep(3); // Checkout step
      }
    }
  }, [searchParams, user]);

  // If user is logged in, skip auth step and go to plan selection
  useEffect(() => {
    if (!authLoading && user) {
      if (currentStep === 1) {
        setCurrentStep(2);
      }
      checkFreeAccount(user.email);
    }
  }, [user, authLoading]);

  // Check URL for slug param
  useEffect(() => {
    const slugParam = searchParams.get("slug");
    if (slugParam && !churchData.slug) {
      setChurchData(prev => ({ ...prev, slug: slugParam }));
    }
  }, [searchParams]);

  // Check URL for plan param
  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam && ["prata", "ouro", "diamante"].includes(planParam)) {
      setSelectedPlan(planParam);
    }
  }, [searchParams]);

  const checkFreeAccount = async (email?: string | null) => {
    if (!email) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-free-account`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const result = await response.json();
      if (result.hasGrantedAccount) {
        setGrantedAccount(result);
        setSelectedPlan(result.plan);
      }
    } catch (error) {
      console.error("Error checking free account:", error);
    }
  };

  const handleAuthSubmit = async (data: AuthFormData) => {
    if (data.userPassword !== data.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (data.userPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: authResult, error } = await supabase.auth.signUp({
        email: data.userEmail,
        password: data.userPassword,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: data.userName,
          },
        },
      });

      if (error) throw error;

      if (authResult.user) {
        setAuthData(data);
        await checkFreeAccount(data.userEmail);
        setCurrentStep(2);
        toast.success("Conta criada com sucesso!");
      }
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    
    // If it's a granted free account, go directly to church creation
    if (grantedAccount?.hasGrantedAccount) {
      setCurrentStep(4); // Church data step
    } else {
      setCurrentStep(3); // Checkout step
    }
  };

  const handleCheckoutSuccess = (churchId: string) => {
    // This is called when returning from successful payment
    // The CheckoutSuccess page handles this flow
  };

  const handleChurchSubmit = async (data: ChurchFormData) => {
    if (!user) {
      toast.error("Você precisa estar logado");
      setCurrentStep(1);
      return;
    }

    if (!grantedAccount?.hasGrantedAccount) {
      toast.error("Erro no fluxo de pagamento");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create church for free account
      const { data: churchId, error: churchError } = await supabase.rpc(
        "create_church_with_defaults",
        {
          p_name: data.churchName,
          p_slug: data.slug,
          p_owner_id: user.id,
          p_email: data.email,
          p_phone: data.phone || null,
          p_description: data.description || null,
        }
      );

      if (churchError) {
        if (churchError.code === "23505") {
          throw new Error("Este endereço já está em uso. Escolha outro.");
        }
        throw churchError;
      }

      // Update church with granted plan
      await supabase
        .from("churches")
        .update({ 
          status: "active",
          plan: grantedAccount.plan,
        })
        .eq("id", churchId);

      // Activate free account
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-free-account`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              churchId,
              churchName: data.churchName,
            }),
          }
        );
      } catch (error) {
        console.error("Error activating free account:", error);
      }

      // Add church_owner role
      await supabase.from("user_roles").upsert({
        user_id: user.id,
        role: "church_owner",
      }, { onConflict: "user_id,role" });

      // Clear saved data
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("pending_church_id");
      localStorage.removeItem("pending_plan");

      toast.success(`Igreja criada com plano ${grantedAccount.plan?.toUpperCase()} gratuito!`);
      navigate(`/onboarding/${data.slug}`);
    } catch (error: any) {
      console.error("Error creating church:", error);
      toast.error(error.message || "Erro ao criar igreja");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ churchData, selectedPlan }));
    const slug = churchData.slug ? `&slug=${churchData.slug}` : "";
    navigate(`/login?redirect=/criar-igreja/wizard${slug}`);
  };

  // Calculate steps based on user state and flow
  // Logged in: Plan -> Checkout -> (webhook activates) -> Admin
  // Not logged in: Auth -> Plan -> Checkout -> (webhook activates) -> Admin
  // Free account: Auth/Skip -> Plan -> Church Data -> Admin
  
  const getSteps = () => {
    if (grantedAccount?.hasGrantedAccount) {
      return user 
        ? ["Escolha o Plano", "Dados da Igreja"]
        : ["Criar Conta", "Escolha o Plano", "Dados da Igreja"];
    }
    return user 
      ? ["Escolha o Plano", "Pagamento"]
      : ["Criar Conta", "Escolha o Plano", "Pagamento"];
  };

  const steps = getSteps();
  const totalSteps = steps.length;
  
  // Adjust display step based on whether user is logged in
  const getDisplayStep = () => {
    if (user) {
      // Logged in: step 2 = plan, step 3 = checkout/church
      return currentStep - 1;
    }
    return currentStep;
  };

  const displayStep = getDisplayStep();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <PortalLogo className="h-8 w-8" />
                <span className="text-xl font-bold text-foreground">Portal Igrejas</span>
              </Link>
              <Button variant="ghost" asChild>
                <Link to="/" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Step Indicator */}
            <WizardStepIndicator
              currentStep={displayStep}
              totalSteps={totalSteps}
              steps={steps}
            />

            {/* Step 1: Auth (only for non-logged users) */}
            {currentStep === 1 && !user && (
              <WizardStepAuth
                onSubmit={handleAuthSubmit}
                onLogin={handleLogin}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Step 2: Plan Selection */}
            {currentStep === 2 && (
              <WizardStepPlan
                selectedPlan={selectedPlan}
                onSelectPlan={handlePlanSelect}
                grantedAccount={grantedAccount}
                onBack={() => !user && setCurrentStep(1)}
                showBack={!user}
              />
            )}

            {/* Step 3: Checkout (for paid plans) */}
            {currentStep === 3 && selectedPlan && !grantedAccount?.hasGrantedAccount && (
              <WizardStepCheckout
                selectedPlan={selectedPlan}
                churchData={churchData}
                userEmail={user?.email || authData.userEmail}
                userName={authData.userName}
                onBack={() => setCurrentStep(2)}
                onSuccess={handleCheckoutSuccess}
              />
            )}

            {/* Step 4: Church Data (only for free accounts) */}
            {(currentStep === 4 || (currentStep === 3 && grantedAccount?.hasGrantedAccount)) && (
              <WizardStepChurch
                data={churchData}
                onChange={setChurchData}
                onSubmit={handleChurchSubmit}
                onBack={() => setCurrentStep(2)}
                isSubmitting={isSubmitting}
                selectedPlan={grantedAccount?.plan || selectedPlan}
              />
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ChurchWizard;
