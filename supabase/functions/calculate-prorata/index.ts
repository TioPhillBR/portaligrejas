import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  prata: 69,
  ouro: 119,
  diamante: 189,
};

interface ProRataRequest {
  churchId: string;
  currentPlan: string;
  newPlan: string;
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { churchId, currentPlan, newPlan }: ProRataRequest = await req.json();

    console.log("Calculating pro-rata for:", { churchId, currentPlan, newPlan });

    // Get church data with period info
    const { data: church, error: churchError } = await supabase
      .from("churches")
      .select("*, payment_history(paid_at, amount, plan)")
      .eq("id", churchId)
      .order("paid_at", { referencedTable: "payment_history", ascending: false })
      .limit(1, { referencedTable: "payment_history" })
      .single();

    if (churchError || !church) {
      console.error("Church not found:", churchError);
      return new Response(
        JSON.stringify({ error: "Igreja não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentPrice = PLAN_PRICES[currentPlan] || 0;
    const newPrice = PLAN_PRICES[newPlan] || 0;

    // Check if this is a downgrade
    if (newPrice >= currentPrice) {
      return new Response(
        JSON.stringify({ 
          error: "Pro-rata só se aplica a downgrades",
          isDowngrade: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate remaining days in the current period
    let periodStart = church.current_period_start;
    let periodEnd = church.current_period_end;

    // If no period info, use last payment date or estimate
    if (!periodStart || !periodEnd) {
      const lastPayment = church.payment_history?.[0];
      if (lastPayment?.paid_at) {
        periodStart = lastPayment.paid_at;
        const startDate = new Date(periodStart);
        periodEnd = new Date(startDate.setMonth(startDate.getMonth() + 1)).toISOString();
      } else {
        // No payment history, assume 30 days from now
        periodStart = new Date().toISOString();
        periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const now = new Date();
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    
    // Calculate total and remaining days
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysUsed = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, totalDays - daysUsed);

    // Calculate pro-rata credit
    const dailyRate = currentPrice / 30; // Assuming 30-day months
    const unusedValue = dailyRate * daysRemaining;
    
    // Calculate credit (difference between unused value and new plan cost for remaining days)
    const newDailyRate = newPrice / 30;
    const newPlanCostRemaining = newDailyRate * daysRemaining;
    const proRataCredit = Math.max(0, unusedValue - newPlanCostRemaining);

    console.log("Pro-rata calculation:", {
      totalDays,
      daysUsed,
      daysRemaining,
      currentPrice,
      newPrice,
      dailyRate,
      unusedValue,
      proRataCredit,
    });

    // Update church with pro-rata credit
    await supabase
      .from("churches")
      .update({
        pro_rata_credit: (church.pro_rata_credit || 0) + proRataCredit,
        settings: {
          ...church.settings,
          pending_downgrade: {
            newPlan,
            proRataCredit,
            calculatedAt: new Date().toISOString(),
            daysRemaining,
          },
        },
      })
      .eq("id", churchId);

    return new Response(
      JSON.stringify({
        success: true,
        proRataCredit: Math.round(proRataCredit * 100) / 100,
        daysRemaining,
        totalDays,
        unusedValue: Math.round(unusedValue * 100) / 100,
        newPlanCostRemaining: Math.round(newPlanCostRemaining * 100) / 100,
        periodStart,
        periodEnd,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating pro-rata:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
