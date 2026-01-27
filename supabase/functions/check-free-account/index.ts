import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckFreeAccountRequest {
  email: string;
  churchId?: string;
  churchName?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { email, churchId, churchName }: CheckFreeAccountRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking free account for email:", email);

    // Check if this email has a granted free account
    const { data: grantedAccount, error: grantError } = await supabase
      .from("granted_free_accounts")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_used", false)
      .maybeSingle();

    if (grantError) {
      console.error("Error checking granted account:", grantError);
      return new Response(
        JSON.stringify({ hasGrantedAccount: false, error: grantError.message }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!grantedAccount) {
      return new Response(
        JSON.stringify({ hasGrantedAccount: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if account is expired
    if (grantedAccount.expires_at && new Date(grantedAccount.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ 
          hasGrantedAccount: false, 
          expired: true,
          message: "Conta gratuita expirada" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If churchId is provided, activate the free account
    if (churchId) {
      console.log("Activating free account for church:", churchId);

      // Update the granted account as used
      await supabase
        .from("granted_free_accounts")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
          church_id: churchId,
        })
        .eq("id", grantedAccount.id);

      // Update the church with the granted plan
      await supabase
        .from("churches")
        .update({
          plan: grantedAccount.plan,
          status: "active",
        })
        .eq("id", churchId);

      // Record in subscription history
      await supabase
        .from("subscription_history")
        .insert({
          church_id: churchId,
          old_plan: "free",
          new_plan: grantedAccount.plan,
          change_type: "granted",
          mrr_change: 0, // Free grant, no MRR
        });

      // Notify platform admins
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-free-account`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({
            grantedAccountId: grantedAccount.id,
            churchId,
            churchName: churchName || "Igreja",
          }),
        });
      } catch (notifyError) {
        console.error("Error notifying admins:", notifyError);
        // Don't fail the main operation
      }

      return new Response(
        JSON.stringify({
          hasGrantedAccount: true,
          activated: true,
          plan: grantedAccount.plan,
          message: `Plano ${grantedAccount.plan} ativado com sucesso!`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Just return that there's a granted account available
    return new Response(
      JSON.stringify({
        hasGrantedAccount: true,
        plan: grantedAccount.plan,
        expiresAt: grantedAccount.expires_at,
        notes: grantedAccount.notes,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking free account:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
