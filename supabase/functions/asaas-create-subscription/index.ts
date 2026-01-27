import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ASAAS_API_URL = "https://api.asaas.com/v3";

const PLAN_PRICES: Record<string, number> = {
  prata: 49.90,
  ouro: 99.90,
  diamante: 199.90,
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
  prata: "Plano Prata - Portal Igrejas",
  ouro: "Plano Ouro - Portal Igrejas",
  diamante: "Plano Diamante - Portal Igrejas",
};

interface SubscriptionData {
  customerId: string;
  churchId: string;
  plan: string;
  billingType: "CREDIT_CARD" | "BOLETO" | "PIX";
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      customerId,
      churchId,
      plan,
      billingType,
      creditCard,
      creditCardHolderInfo,
    }: SubscriptionData = await req.json();

    if (!customerId || !churchId || !plan) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const value = PLAN_PRICES[plan];
    if (!value) {
      return new Response(
        JSON.stringify({ error: "Plano inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");
    if (!ASAAS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Chave da API não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate next due date (today + 1 day)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const formattedDate = nextDueDate.toISOString().split("T")[0];

    const subscriptionPayload: Record<string, unknown> = {
      customer: customerId,
      billingType,
      value,
      nextDueDate: formattedDate,
      cycle: "MONTHLY",
      description: PLAN_DESCRIPTIONS[plan],
      externalReference: churchId,
    };

    // Add credit card info if provided
    if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
      subscriptionPayload.creditCard = creditCard;
      subscriptionPayload.creditCardHolderInfo = creditCardHolderInfo;
    }

    const response = await fetch(`${ASAAS_API_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Asaas subscription error:", data);
      return new Response(
        JSON.stringify({ error: data.errors?.[0]?.description || "Erro ao criar assinatura" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update church plan in database
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("churches")
      .update({
        plan,
        settings: {
          asaas_customer_id: customerId,
          asaas_subscription_id: data.id,
        },
      })
      .eq("id", churchId);

    return new Response(
      JSON.stringify({ subscription: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
