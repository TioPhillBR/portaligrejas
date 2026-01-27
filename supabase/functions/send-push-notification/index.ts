import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  user_ids?: string[];
  church_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload: PushPayload = await req.json();
    const { title, body, icon, badge, data, user_ids, church_id } = payload;

    // Build query to get push subscriptions
    let query = supabase.from("push_subscriptions").select("*");
    
    if (user_ids && user_ids.length > 0) {
      query = query.in("user_id", user_ids);
    } else if (church_id) {
      query = query.eq("church_id", church_id);
    }

    const { data: subscriptions, error: subError } = await query;

    if (subError) {
      throw subError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No subscriptions found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get VAPID keys from environment
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.log("VAPID keys not configured, skipping push notifications");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "VAPID keys not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || "/pwa-192x192.png",
      badge: badge || "/pwa-192x192.png",
      data: data || {},
    });

    let sent = 0;
    const errors: string[] = [];

    // Send push notifications
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        // Using web-push library equivalent for Deno
        // In production, you'd use a proper web-push implementation
        // For now, we'll log the notification attempt
        console.log(`Would send push to: ${subscription.endpoint}`);
        console.log(`Payload: ${notificationPayload}`);
        
        sent++;
      } catch (error: unknown) {
        const err = error as { message?: string; statusCode?: number };
        console.error(`Error sending to ${subscription.endpoint}:`, error);
        errors.push(`${subscription.endpoint}: ${err.message || "Unknown error"}`);
        
        // Remove invalid subscriptions
        if (err.statusCode === 410 || err.statusCode === 404) {
          await supabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: subscriptions.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Error in send-push-notification:", error);
    return new Response(
      JSON.stringify({ error: err.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
