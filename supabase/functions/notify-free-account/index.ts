import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyPayload {
  grantedAccountId: string;
  churchId: string;
  churchName: string;
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

    const { grantedAccountId, churchId, churchName }: NotifyPayload = await req.json();

    console.log("Processing free account notification:", { grantedAccountId, churchId, churchName });

    // Get the granted account details
    const { data: grantedAccount, error: grantError } = await supabase
      .from("granted_free_accounts")
      .select("*")
      .eq("id", grantedAccountId)
      .single();

    if (grantError || !grantedAccount) {
      console.error("Granted account not found:", grantError);
      return new Response(
        JSON.stringify({ error: "Conta gratuita não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark the granted account as used
    await supabase
      .from("granted_free_accounts")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        church_id: churchId,
      })
      .eq("id", grantedAccountId);

    // Update the church with the granted plan
    await supabase
      .from("churches")
      .update({
        plan: grantedAccount.plan,
        status: "active",
      })
      .eq("id", churchId);

    // Get admin emails to notify
    const { data: platformAdmins } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "platform_admin");

    if (platformAdmins && platformAdmins.length > 0) {
      // Get admin emails
      for (const admin of platformAdmins) {
        const { data: userData } = await supabase.auth.admin.getUserById(admin.user_id);
        
        if (userData?.user?.email) {
          // Send notification email
          try {
            await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-payment-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                type: "free_account_used",
                to: userData.user.email,
                churchName: churchName,
                ownerName: "Administrador",
                planName: grantedAccount.plan,
                grantedEmail: grantedAccount.email,
              }),
            });
            console.log(`Notification sent to admin: ${userData.user.email}`);
          } catch (emailError) {
            console.error("Error sending email notification:", emailError);
          }
        }
      }
    }

    // Also notify the user who granted the account if different from platform admins
    if (grantedAccount.granted_by) {
      const { data: granterData } = await supabase.auth.admin.getUserById(grantedAccount.granted_by);
      
      if (granterData?.user?.email) {
        const isAlreadyNotified = platformAdmins?.some(a => a.user_id === grantedAccount.granted_by);
        
        if (!isAlreadyNotified) {
          try {
            await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-payment-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                type: "free_account_used",
                to: granterData.user.email,
                churchName: churchName,
                ownerName: "Administrador",
                planName: grantedAccount.plan,
                grantedEmail: grantedAccount.email,
              }),
            });
            console.log(`Notification sent to granter: ${granterData.user.email}`);
          } catch (emailError) {
            console.error("Error sending email to granter:", emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        plan: grantedAccount.plan,
        message: "Conta gratuita ativada com sucesso" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing free account:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
