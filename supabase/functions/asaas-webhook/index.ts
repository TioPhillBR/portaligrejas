import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

interface OwnerInfo {
  email: string;
  name: string;
}

async function getOwnerInfo(supabase: any, churchId: string): Promise<OwnerInfo | null> {
  try {
    // 1. Try church email first
    const { data: church } = await supabase
      .from("churches")
      .select("email, name, owner_id")
      .eq("id", churchId)
      .single();

    if (church?.email) {
      return { email: church.email, name: church.name };
    }

    // 2. Find owner via church_members
    const { data: owner } = await supabase
      .from("church_members")
      .select("user_id")
      .eq("church_id", churchId)
      .eq("role", "owner")
      .single();

    if (owner?.user_id) {
      // Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", owner.user_id)
        .single();

      // Get email via admin API
      const { data: { user } } = await supabase.auth.admin.getUserById(owner.user_id);
      
      if (user?.email) {
        return { 
          email: user.email, 
          name: profile?.full_name || church?.name || "Administrador" 
        };
      }
    }

    // 3. Try owner_id from church
    if (church?.owner_id) {
      const { data: { user } } = await supabase.auth.admin.getUserById(church.owner_id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", church.owner_id)
        .single();

      if (user?.email) {
        return { 
          email: user.email, 
          name: profile?.full_name || church?.name || "Administrador" 
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting owner info:", error);
    return null;
  }
}

async function sendPaymentEmail(
  type: string, 
  ownerInfo: OwnerInfo, 
  churchName: string, 
  planName?: string,
  daysOverdue?: number
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    
    const response = await fetch(`${supabaseUrl}/functions/v1/send-payment-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        type,
        to: ownerInfo.email,
        churchName,
        ownerName: ownerInfo.name,
        planName,
        daysOverdue,
      }),
    });

    const result = await response.json();
    console.log(`Email ${type} sent:`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send ${type} email:`, error);
    // Don't throw - email failure shouldn't block webhook processing
    return null;
  }
}

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

    const churchId = subscription?.externalReference || payment?.externalReference;

    if (!churchId) {
      console.log("No church ID found in webhook payload");
      return new Response(
        JSON.stringify({ received: true, message: "No church ID found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get church data
    const { data: church } = await supabase
      .from("churches")
      .select("id, name, email, plan, pending_plan, payment_overdue_at, status")
      .eq("id", churchId)
      .single();

    if (!church) {
      console.log(`Church not found: ${churchId}`);
      return new Response(
        JSON.stringify({ received: true, message: "Church not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ownerInfo = await getOwnerInfo(supabase, churchId);

    // Handle payment confirmation events
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      console.log(`Payment confirmed for church ${churchId}`);

      const updateData: any = {
        status: "active",
        payment_overdue_at: null,
      };

      // Apply pending plan if exists
      if (church.pending_plan) {
        updateData.plan = church.pending_plan;
        updateData.pending_plan = null;
      }

      // Store Asaas subscription ID if present
      if (subscription?.id) {
        updateData.asaas_subscription_id = subscription.id;
      }

      await supabase
        .from("churches")
        .update(updateData)
        .eq("id", churchId);

      console.log(`Church ${churchId} activated with plan: ${updateData.plan || church.plan}`);

      // Send confirmation email
      if (ownerInfo) {
        await sendPaymentEmail(
          "payment_confirmed",
          ownerInfo,
          church.name,
          updateData.plan || church.plan
        );
      }
    }

    // Handle payment overdue events
    if (event === "PAYMENT_OVERDUE") {
      console.log(`Payment overdue for church ${churchId}`);

      let overdueDate = church.payment_overdue_at;
      let daysOverdue = 0;

      if (!overdueDate) {
        // First overdue - register date
        overdueDate = new Date().toISOString();
        await supabase
          .from("churches")
          .update({ payment_overdue_at: overdueDate })
          .eq("id", churchId);
        
        console.log(`First overdue registered for church ${churchId}`);
      }

      // Calculate days overdue
      daysOverdue = Math.floor(
        (Date.now() - new Date(overdueDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log(`Church ${churchId} is ${daysOverdue} days overdue`);

      // Suspend after 7 days
      if (daysOverdue >= 7 && church.status !== "suspended") {
        await supabase
          .from("churches")
          .update({ status: "suspended" })
          .eq("id", churchId);

        console.log(`Church ${churchId} suspended after ${daysOverdue} days overdue`);

        // Send suspended email
        if (ownerInfo) {
          await sendPaymentEmail("church_suspended", ownerInfo, church.name);
        }
      } else if (ownerInfo) {
        // Send overdue warning email
        await sendPaymentEmail("payment_overdue", ownerInfo, church.name, undefined, daysOverdue);
      }
    }

    // Handle payment deleted
    if (event === "PAYMENT_DELETED") {
      console.log(`Payment deleted for church ${churchId}`);
      // Just log for now, don't take action on deleted payments
    }

    // Handle subscription cancellation events
    if (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED") {
      console.log(`Subscription cancelled for church ${churchId}`);

      await supabase
        .from("churches")
        .update({
          plan: "free",
          pending_plan: null,
          asaas_subscription_id: null,
          payment_overdue_at: null,
        })
        .eq("id", churchId);

      console.log(`Church ${churchId} downgraded to free plan`);

      // Send cancellation email
      if (ownerInfo) {
        await sendPaymentEmail("subscription_cancelled", ownerInfo, church.name);
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
