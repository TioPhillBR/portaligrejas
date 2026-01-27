import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentWithChurch {
  id: string;
  church_id: string;
  due_date: string;
  amount: number;
  status: string;
  plan: string;
  churches: {
    id: string;
    name: string;
    email: string;
    owner_id: string;
  };
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const oneDayFromNow = new Date(today);
    oneDayFromNow.setDate(today.getDate() + 1);

    // Format dates for comparison
    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Get pending payments with due dates 3 days from now
    const { data: threeDayPayments, error: error3 } = await supabase
      .from("payment_history")
      .select(`
        id,
        church_id,
        due_date,
        amount,
        status,
        plan,
        churches:church_id (id, name, email, owner_id)
      `)
      .eq("status", "pending")
      .eq("due_date", formatDate(threeDaysFromNow));

    if (error3) {
      console.error("Error fetching 3-day payments:", error3);
    }

    // Get pending payments with due dates 1 day from now
    const { data: oneDayPayments, error: error1 } = await supabase
      .from("payment_history")
      .select(`
        id,
        church_id,
        due_date,
        amount,
        status,
        plan,
        churches:church_id (id, name, email, owner_id)
      `)
      .eq("status", "pending")
      .eq("due_date", formatDate(oneDayFromNow));

    if (error1) {
      console.error("Error fetching 1-day payments:", error1);
    }

    const results = {
      threeDayReminders: 0,
      oneDayReminders: 0,
      errors: [] as string[],
    };

    // Helper function to get owner info
    const getOwnerInfo = async (church: any) => {
      if (church.email) {
        return { email: church.email, name: church.name };
      }

      // Get owner from church_members
      const { data: owner } = await supabase
        .from("church_members")
        .select("user_id")
        .eq("church_id", church.id)
        .eq("role", "owner")
        .single();

      if (owner?.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", owner.user_id)
          .single();

        const { data: { user } } = await supabase.auth.admin.getUserById(owner.user_id);

        if (user?.email) {
          return {
            email: user.email,
            name: profile?.full_name || church.name,
          };
        }
      }

      return null;
    };

    // Send 3-day reminders
    if (threeDayPayments && threeDayPayments.length > 0) {
      for (const payment of threeDayPayments as unknown as PaymentWithChurch[]) {
        try {
          const ownerInfo = await getOwnerInfo(payment.churches);
          if (ownerInfo) {
            await fetch(`${supabaseUrl}/functions/v1/send-payment-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                type: "invoice_reminder_3days",
                to: ownerInfo.email,
                churchName: payment.churches.name,
                ownerName: ownerInfo.name,
                planName: payment.plan,
                amount: payment.amount,
                dueDate: payment.due_date,
              }),
            });
            results.threeDayReminders++;
            console.log(`Sent 3-day reminder to ${ownerInfo.email} for church ${payment.churches.name}`);
          }
        } catch (err) {
          const error = err instanceof Error ? err.message : "Unknown error";
          results.errors.push(`3-day reminder failed for ${payment.church_id}: ${error}`);
        }
      }
    }

    // Send 1-day reminders
    if (oneDayPayments && oneDayPayments.length > 0) {
      for (const payment of oneDayPayments as unknown as PaymentWithChurch[]) {
        try {
          const ownerInfo = await getOwnerInfo(payment.churches);
          if (ownerInfo) {
            await fetch(`${supabaseUrl}/functions/v1/send-payment-email`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                type: "invoice_reminder_1day",
                to: ownerInfo.email,
                churchName: payment.churches.name,
                ownerName: ownerInfo.name,
                planName: payment.plan,
                amount: payment.amount,
                dueDate: payment.due_date,
              }),
            });
            results.oneDayReminders++;
            console.log(`Sent 1-day reminder to ${ownerInfo.email} for church ${payment.churches.name}`);
          }
        } catch (err) {
          const error = err instanceof Error ? err.message : "Unknown error";
          results.errors.push(`1-day reminder failed for ${payment.church_id}: ${error}`);
        }
      }
    }

    console.log("Invoice reminders completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in invoice-reminders:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process invoice reminders" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
