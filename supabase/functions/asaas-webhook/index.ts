import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body, null, 2));

    const { event, payment, subscription } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Handle subscription events
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      if (subscription?.externalReference) {
        const churchId = subscription.externalReference;
        
        // Update church to active if payment confirmed
        await supabase
          .from("churches")
          .update({ status: "active" })
          .eq("id", churchId);

        console.log(`Church ${churchId} activated after payment confirmation`);
      }
    }

    if (event === "PAYMENT_OVERDUE" || event === "PAYMENT_DELETED") {
      if (subscription?.externalReference) {
        const churchId = subscription.externalReference;
        
        // Could suspend church after multiple overdue payments
        console.log(`Payment issue for church ${churchId}: ${event}`);
      }
    }

    if (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED") {
      if (subscription?.externalReference) {
        const churchId = subscription.externalReference;
        
        // Downgrade to free plan
        await supabase
          .from("churches")
          .update({ plan: "free" })
          .eq("id", churchId);

        console.log(`Church ${churchId} downgraded to free plan`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Webhook processing failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
