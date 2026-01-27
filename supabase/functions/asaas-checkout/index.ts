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
  couponCode?: string;
}

interface CouponData {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  current_uses: number;
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
      couponCode,
    }: CheckoutData = await req.json();

    if (!churchId || !plan || !customerName || !customerEmail || !customerCpfCnpj) {
      return new Response(
        JSON.stringify({ error: "Dados incompletos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let value = PLAN_PRICES[plan];
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

    // Create service client for coupon validation
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let appliedCoupon: CouponData | null = null;
    let discountApplied = 0;

    // Validate and apply coupon if provided
    if (couponCode) {
      console.log("Validating coupon:", couponCode);
      
      const { data: coupon, error: couponError } = await serviceClient
        .from("discount_coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .single();

      if (couponError || !coupon) {
        console.log("Coupon not found or inactive:", couponCode);
        return new Response(
          JSON.stringify({ error: "Cupom inválido ou expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check validity dates
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        return new Response(
          JSON.stringify({ error: "Cupom ainda não está válido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        return new Response(
          JSON.stringify({ error: "Cupom expirado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check usage limit
      if (coupon.max_uses !== null && coupon.current_uses >= coupon.max_uses) {
        return new Response(
          JSON.stringify({ error: "Cupom esgotado" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate discount
      if (coupon.discount_type === "percentage") {
        discountApplied = value * (coupon.discount_value / 100);
      } else {
        discountApplied = Math.min(coupon.discount_value, value);
      }

      value = Math.max(0, value - discountApplied);
      appliedCoupon = coupon;
      
      console.log(`Coupon applied: ${coupon.code}, discount: R$ ${discountApplied.toFixed(2)}, final value: R$ ${value.toFixed(2)}`);
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
    await serviceClient
      .from("churches")
      .update({
        settings: {
          pending_plan: plan,
          asaas_payment_link_id: data.id,
          applied_coupon: appliedCoupon?.code || null,
          discount_applied: discountApplied,
        },
      })
      .eq("id", churchId);

    // Record coupon usage if applied
    if (appliedCoupon) {
      await serviceClient
        .from("coupon_uses")
        .insert({
          coupon_id: appliedCoupon.id,
          church_id: churchId,
          discount_applied: discountApplied,
        });

      // Increment coupon usage count
      await serviceClient
        .from("discount_coupons")
        .update({ current_uses: appliedCoupon.current_uses + 1 })
        .eq("id", appliedCoupon.id);
    }

    return new Response(
      JSON.stringify({ 
        paymentLink: data.url,
        paymentLinkId: data.id,
        discountApplied: discountApplied > 0 ? discountApplied : undefined,
        finalValue: value,
        couponApplied: appliedCoupon?.code || undefined,
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
