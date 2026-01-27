import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log("Starting daily overdue payment check...");

    // Buscar igrejas com pagamento em atraso
    const { data: overdueChurches, error: fetchError } = await supabase
      .from("churches")
      .select(`
        id,
        name,
        email,
        status,
        plan,
        payment_overdue_at,
        owner_id
      `)
      .not("payment_overdue_at", "is", null)
      .neq("status", "suspended")
      .neq("plan", "free");

    if (fetchError) {
      console.error("Error fetching overdue churches:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${overdueChurches?.length || 0} churches with overdue payments`);

    const results = {
      processed: 0,
      suspended: 0,
      reminders_sent: 0,
      errors: [] as string[],
    };

    for (const church of overdueChurches || []) {
      try {
        const overdueDate = new Date(church.payment_overdue_at);
        const daysOverdue = Math.floor(
          (Date.now() - overdueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(`Church ${church.name}: ${daysOverdue} days overdue`);

        // Se >= 7 dias, suspender
        if (daysOverdue >= 7) {
          await supabase
            .from("churches")
            .update({ status: "suspended" })
            .eq("id", church.id);

          results.suspended++;

          // Enviar email de suspensão
          await sendNotificationEmail(supabase, church, "church_suspended", daysOverdue);
        } else {
          // Enviar lembrete diário
          await sendNotificationEmail(supabase, church, "payment_overdue", daysOverdue);
          results.reminders_sent++;
        }

        results.processed++;
      } catch (err: any) {
        console.error(`Error processing church ${church.id}:`, err);
        results.errors.push(`${church.name}: ${err.message}`);
      }
    }

    console.log("Daily check completed:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in check-overdue-payments:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function sendNotificationEmail(
  supabase: any,
  church: any,
  type: "payment_overdue" | "church_suspended",
  daysOverdue: number
) {
  try {
    // Buscar email do owner
    let ownerEmail = church.email;
    let ownerName = church.name;

    if (!ownerEmail && church.owner_id) {
      const { data: owner } = await supabase
        .from("church_members")
        .select("user_id, profiles(full_name)")
        .eq("church_id", church.id)
        .eq("role", "owner")
        .single();

      if (owner?.user_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(owner.user_id);
        ownerEmail = userData?.user?.email;
        ownerName = owner.profiles?.full_name || church.name;
      }
    }

    if (!ownerEmail) {
      console.log(`No email found for church ${church.name}, skipping notification`);
      return;
    }

    // Chamar edge function de email
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-payment-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        type,
        to: ownerEmail,
        churchName: church.name,
        ownerName,
        daysOverdue,
        daysRemaining: 7 - daysOverdue,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send email: ${errorText}`);
    } else {
      console.log(`Email sent to ${ownerEmail} for church ${church.name}`);
    }
  } catch (err) {
    console.error("Error sending notification email:", err);
  }
}

serve(handler);
