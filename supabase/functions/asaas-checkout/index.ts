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

const PLAN_NAMES: Record<string, string> = {
  prata: "Plano Prata",
  ouro: "Plano Ouro",
  diamante: "Plano Diamante",
};

interface CheckoutData {
  churchId: string;
  plan: string;
  customerName: string;
  customerEmail: string;
  customerCpfCnpj: string;
  customerPhone?: string;
  successUrl: string;
  cancelUrl: string;
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
      churchId,
      plan,
      customerName,
      customerEmail,
      customerCpfCnpj,
      customerPhone,
      successUrl,
      cancelUrl,
    }: CheckoutData = await req.json();

    if (!churchId || !plan || !customerName || !customerEmail || !customerCpfCnpj) {
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

    // Create payment link with subscription
    const paymentLinkPayload = {
      billingType: "UNDEFINED", // Allows customer to choose
      chargeType: "RECURRENT",
      name: PLAN_NAMES[plan],
      description: `Assinatura ${PLAN_NAMES[plan]} - Portal Igrejas`,
      value,
      subscriptionCycle: "MONTHLY",
      maxInstallmentCount: 1,
      dueDateLimitDays: 3,
      callback: {
        successUrl,
        cancelUrl: cancelUrl || successUrl,
        autoRedirect: true,
      },
      customerData: {
        name: customerName,
        email: customerEmail,
        cpfCnpj: customerCpfCnpj.replace(/\D/g, ""),
        phone: customerPhone?.replace(/\D/g, "") || undefined,
      },
      externalReference: churchId,
    };

    const response = await fetch(`${ASAAS_API_URL}/paymentLinks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify(paymentLinkPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Asaas payment link error:", data);
      return new Response(
        JSON.stringify({ error: data.errors?.[0]?.description || "Erro ao criar link de pagamento" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update church with pending subscription info
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("churches")
      .update({
        settings: {
          pending_plan: plan,
          asaas_payment_link_id: data.id,
        },
      })
      .eq("id", churchId);

    return new Response(
      JSON.stringify({ 
        paymentLink: data.url,
        paymentLinkId: data.id,
      }),
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
