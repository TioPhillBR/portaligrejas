import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, asaas-access-token",
};

interface OwnerInfo {
  email: string;
  name: string;
  userId: string;
}

async function getOwnerInfo(supabase: any, churchId: string): Promise<OwnerInfo | null> {
  try {
    // Get church data
    const { data: church } = await supabase
      .from("churches")
      .select("email, name, owner_id")
      .eq("id", churchId)
      .single();

    if (!church?.owner_id) {
      console.log("No owner_id found for church");
      return null;
    }

    // Get profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", church.owner_id)
      .single();

    // Get email via admin API
    const { data: { user } } = await supabase.auth.admin.getUserById(church.owner_id);

    if (user?.email) {
      return {
        email: church.email || user.email,
        name: profile?.full_name || church?.name || "Administrador",
        userId: church.owner_id,
      };
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
    return null;
  }
}

async function sendPushNotification(
  supabase: any,
  churchId: string,
  title: string,
  body: string
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        title,
        body,
        church_id: churchId,
        target_admins: true,
      }),
    });

    console.log(`Push notification sent for church ${churchId}`);
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
}

async function assignChurchOwnerRole(supabase: any, userId: string) {
  try {
    // Check if role already exists
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role", "church_owner")
      .single();

    if (!existingRole) {
      await supabase.from("user_roles").insert({
        user_id: userId,
        role: "church_owner",
      });
      console.log(`church_owner role assigned to user ${userId}`);
    } else {
      console.log(`User ${userId} already has church_owner role`);
    }
  } catch (error) {
    console.error("Error assigning church_owner role:", error);
  }
}

async function recordSubscriptionHistory(
  supabase: any,
  churchId: string,
  changeType: string,
  oldPlan: string | null,
  newPlan: string,
  mrrChange: number
) {
  try {
    await supabase.from("subscription_history").insert({
      church_id: churchId,
      change_type: changeType,
      old_plan: oldPlan,
      new_plan: newPlan,
      mrr_change: mrrChange,
    });
    console.log(`Subscription history recorded: ${changeType}`);
  } catch (error) {
    console.error("Error recording subscription history:", error);
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
      .select("id, name, email, plan, status, owner_id, payment_overdue_at")
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
    const wasActivation = church.status === "pending_payment";

    // Handle payment confirmation events
    if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {
      console.log(`Payment confirmed for church ${churchId}`);

      const previousPlan = church.plan;
      const updateData: any = {
        status: "active",
        payment_overdue_at: null,
      };

      // Store Asaas subscription ID if present
      if (subscription?.id) {
        updateData.asaas_subscription_id = subscription.id;
      }

      await supabase
        .from("churches")
        .update(updateData)
        .eq("id", churchId);

      // Record payment in payment_history
      if (payment) {
        await supabase.from("payment_history").upsert(
          {
            church_id: churchId,
            asaas_payment_id: payment.id,
            asaas_subscription_id: subscription?.id || null,
            amount: payment.value || 0,
            status: "paid",
            payment_method: payment.billingType || null,
            billing_type: payment.billingType || null,
            due_date: payment.dueDate || null,
            paid_at: new Date().toISOString(),
            invoice_url: payment.invoiceUrl || payment.bankSlipUrl || null,
            description: `Pagamento - Plano ${church.plan}`,
            plan: church.plan,
          },
          { onConflict: "asaas_payment_id" }
        );
        console.log(`Payment ${payment.id} recorded in payment_history`);
      }

      // If this was a new activation (pending_payment -> active)
      if (wasActivation && ownerInfo) {
        console.log(`New church activation for ${churchId}`);

        // 1. Assign church_owner role to the user
        await assignChurchOwnerRole(supabase, ownerInfo.userId);

        // 2. Record subscription history
        const planPrices: Record<string, number> = {
          prata: 69,
          ouro: 119,
          diamante: 189,
        };
        await recordSubscriptionHistory(
          supabase,
          churchId,
          "new",
          null,
          church.plan || "prata",
          planPrices[church.plan || "prata"] || 0
        );

        // 3. Create in-app notification
        await supabase.from("in_app_notifications").insert({
          user_id: ownerInfo.userId,
          church_id: churchId,
          title: "Bem-vindo ao Portal Igrejas! 🎉",
          message: `Sua igreja "${church.name}" foi ativada com sucesso. Explore o painel administrativo para começar a configurar seu site.`,
          type: "info",
          reference_type: "church",
          reference_id: churchId,
        });

        // 4. Send push notification
        await sendPushNotification(
          supabase,
          churchId,
          "Igreja Ativada! 🎉",
          `Sua igreja "${church.name}" está pronta. Acesse o painel para começar.`
        );

        // 5. Send confirmation email
        await sendPaymentEmail(
          "payment_confirmed",
          ownerInfo,
          church.name,
          church.plan
        );
      } else if (ownerInfo) {
        // Regular payment confirmation (not first activation)
        await sendPaymentEmail(
          "payment_confirmed",
          ownerInfo,
          church.name,
          church.plan
        );
      }

      console.log(`Church ${churchId} activated with plan: ${church.plan}`);
    }

    // Handle payment overdue events
    if (event === "PAYMENT_OVERDUE") {
      console.log(`Payment overdue for church ${churchId}`);

      let overdueDate = church.payment_overdue_at;
      let daysOverdue = 0;

      if (!overdueDate) {
        overdueDate = new Date().toISOString();
        await supabase
          .from("churches")
          .update({ payment_overdue_at: overdueDate })
          .eq("id", churchId);

        console.log(`First overdue registered for church ${churchId}`);
      }

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

        if (ownerInfo) {
          await sendPaymentEmail("church_suspended", ownerInfo, church.name);
          
          // Create in-app notification
          await supabase.from("in_app_notifications").insert({
            user_id: ownerInfo.userId,
            church_id: churchId,
            title: "Site Suspenso",
            message: "Seu site foi suspenso por falta de pagamento. Regularize para reativar.",
            type: "error",
          });
        }
      } else if (ownerInfo) {
        await sendPaymentEmail("payment_overdue", ownerInfo, church.name, undefined, daysOverdue);
      }
    }

    // Handle payment deleted
    if (event === "PAYMENT_DELETED") {
      console.log(`Payment deleted for church ${churchId}`);
      if (payment?.id) {
        await supabase
          .from("payment_history")
          .update({ status: "cancelled" })
          .eq("asaas_payment_id", payment.id);
      }
    }

    // Handle payment created (new invoice)
    if (event === "PAYMENT_CREATED") {
      console.log(`Payment created for church ${churchId}`);
      if (payment) {
        await supabase.from("payment_history").upsert(
          {
            church_id: churchId,
            asaas_payment_id: payment.id,
            asaas_subscription_id: subscription?.id || null,
            amount: payment.value || 0,
            status: "pending",
            payment_method: payment.billingType || null,
            billing_type: payment.billingType || null,
            due_date: payment.dueDate || null,
            invoice_url: payment.invoiceUrl || payment.bankSlipUrl || null,
            description: `Fatura - Plano ${church.plan}`,
            plan: church.plan,
          },
          { onConflict: "asaas_payment_id" }
        );
        console.log(`Payment ${payment.id} created in payment_history`);
      }
    }

    // Handle payment updated
    if (event === "PAYMENT_UPDATED") {
      console.log(`Payment updated for church ${churchId}`);
      if (payment?.id) {
        await supabase
          .from("payment_history")
          .update({
            amount: payment.value || 0,
            due_date: payment.dueDate || null,
            invoice_url: payment.invoiceUrl || payment.bankSlipUrl || null,
          })
          .eq("asaas_payment_id", payment.id);
      }
    }

    // Handle subscription cancellation events
    if (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED") {
      console.log(`Subscription cancelled for church ${churchId}`);

      const previousPlan = church.plan;
      const planPrices: Record<string, number> = {
        prata: 69,
        ouro: 119,
        diamante: 189,
      };

      await supabase
        .from("churches")
        .update({
          plan: "free",
          asaas_subscription_id: null,
          payment_overdue_at: null,
        })
        .eq("id", churchId);

      // Record churn in subscription history
      await recordSubscriptionHistory(
        supabase,
        churchId,
        "churn",
        previousPlan,
        "free",
        -(planPrices[previousPlan || "prata"] || 0)
      );

      console.log(`Church ${churchId} downgraded to free plan`);

      if (ownerInfo) {
        await sendPaymentEmail("subscription_cancelled", ownerInfo, church.name);
        
        await supabase.from("in_app_notifications").insert({
          user_id: ownerInfo.userId,
          church_id: churchId,
          title: "Assinatura Cancelada",
          message: "Sua assinatura foi cancelada. Seu site continua ativo no plano gratuito.",
          type: "warning",
        });
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
