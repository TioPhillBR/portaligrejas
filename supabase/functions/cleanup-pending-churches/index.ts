import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    console.log(`Cleaning up churches with pending_payment status older than ${twentyFourHoursAgo.toISOString()}`);

    // Find churches with pending_payment status older than 24 hours
    const { data: pendingChurches, error: fetchError } = await supabase
      .from("churches")
      .select("id, name, slug, owner_id, created_at")
      .eq("status", "pending_payment")
      .lt("created_at", twentyFourHoursAgo.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (!pendingChurches || pendingChurches.length === 0) {
      console.log("No pending churches to cleanup");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No pending churches to cleanup",
          cleaned: 0,
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`Found ${pendingChurches.length} churches to cleanup:`, pendingChurches.map(c => c.slug));

    // Delete related data first (due to foreign keys)
    const churchIds = pendingChurches.map(c => c.id);

    // Delete home_sections
    await supabase
      .from("home_sections")
      .delete()
      .in("church_id", churchIds);

    // Delete site_settings
    await supabase
      .from("site_settings")
      .delete()
      .in("church_id", churchIds);

    // Delete theme_settings
    await supabase
      .from("theme_settings")
      .delete()
      .in("church_id", churchIds);

    // Delete church_members
    await supabase
      .from("church_members")
      .delete()
      .in("church_id", churchIds);

    // Delete payment_history (if any)
    await supabase
      .from("payment_history")
      .delete()
      .in("church_id", churchIds);

    // Finally, delete the churches
    const { error: deleteError } = await supabase
      .from("churches")
      .delete()
      .in("id", churchIds);

    if (deleteError) {
      throw deleteError;
    }

    // Log cleanup for each church
    for (const church of pendingChurches) {
      console.log(`Cleaned up pending church: ${church.name} (${church.slug})`);
    }

    console.log(`Successfully cleaned up ${pendingChurches.length} pending churches`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleaned up ${pendingChurches.length} pending churches`,
        cleaned: pendingChurches.length,
        churches: pendingChurches.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error in cleanup-pending-churches:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
