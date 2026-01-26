import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find posts that are scheduled and past their scheduled time
    const now = new Date().toISOString();
    
    const { data: postsToPublish, error: fetchError } = await supabase
      .from("blog_posts")
      .select("id, title")
      .eq("is_published", false)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", now);

    if (fetchError) {
      throw fetchError;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      return new Response(
        JSON.stringify({ message: "No posts to publish", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Publish all scheduled posts
    const postIds = postsToPublish.map((p) => p.id);
    
    const { error: updateError } = await supabase
      .from("blog_posts")
      .update({ 
        is_published: true, 
        published_at: now,
        scheduled_at: null 
      })
      .in("id", postIds);

    if (updateError) {
      throw updateError;
    }

    console.log(`Published ${postsToPublish.length} scheduled posts:`, postsToPublish.map(p => p.title));

    return new Response(
      JSON.stringify({ 
        message: "Posts published successfully", 
        count: postsToPublish.length,
        posts: postsToPublish.map(p => p.title)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error publishing scheduled posts:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
