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
  target_admins?: boolean;
}

interface Subscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_id: string;
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

    const payload: PushPayload = await req.json();
    const { title, body, icon, badge, data, user_ids, church_id, target_admins } = payload;

    // Build query to get push subscriptions
    let query = supabase.from("push_subscriptions").select("*");

    if (user_ids && user_ids.length > 0) {
      query = query.in("user_id", user_ids);
    } else if (church_id && target_admins) {
      // Get admin user IDs for this church
      const { data: admins } = await supabase
        .from("church_members")
        .select("user_id")
        .eq("church_id", church_id)
        .in("role", ["owner", "admin"])
        .eq("is_active", true);

      if (admins && admins.length > 0) {
        const adminIds = admins.map((a) => a.user_id);
        query = query.in("user_id", adminIds);
      } else {
        return new Response(
          JSON.stringify({ success: true, sent: 0, message: "No admins found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    const invalidSubscriptions: string[] = [];

    // For now, we use a simplified approach that logs the push attempts
    // Full Web Push implementation requires complex encryption
    // In production, consider using a service like Firebase Cloud Messaging
    
    for (const subscription of subscriptions as Subscription[]) {
      try {
        console.log(`Push notification prepared for endpoint: ${subscription.endpoint.substring(0, 60)}...`);
        console.log(`Payload: ${notificationPayload}`);
        
        // Try to send using basic fetch (may not work for all push services)
        // This is a placeholder - real implementation needs web-push encryption
        const response = await fetch(subscription.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "TTL": "86400",
          },
          body: notificationPayload,
        });

        if (response.ok || response.status === 201) {
          sent++;
          console.log(`Push sent successfully to ${subscription.endpoint.substring(0, 40)}...`);
        } else if (response.status === 410 || response.status === 404) {
          // Subscription no longer valid
          console.log(`Subscription expired: ${subscription.endpoint.substring(0, 40)}...`);
          invalidSubscriptions.push(subscription.id);
        } else {
          console.log(`Push failed with status ${response.status} for ${subscription.endpoint.substring(0, 40)}...`);
          errors.push(`${subscription.endpoint.substring(0, 30)}...: HTTP ${response.status}`);
        }
      } catch (error: unknown) {
        const err = error as { message?: string };
        console.error(`Push error for ${subscription.endpoint.substring(0, 40)}:`, error);
        // Don't add to errors array - fetch might fail due to CORS or other issues
        // but that doesn't mean the subscription is invalid
      }
    }

    // Remove invalid subscriptions
    if (invalidSubscriptions.length > 0) {
      await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", invalidSubscriptions);
      console.log(`Removed ${invalidSubscriptions.length} invalid subscriptions`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        total: subscriptions.length,
        removed: invalidSubscriptions.length,
        message: "Push notifications processed. Note: Full Web Push encryption requires additional setup.",
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
