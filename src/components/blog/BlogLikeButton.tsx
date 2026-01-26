import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlogLikeButtonProps {
  postId: string;
  variant?: "default" | "compact";
}

const BlogLikeButton = ({ postId, variant = "default" }: BlogLikeButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likesData } = useQuery({
    queryKey: ["blog-likes", postId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("blog_likes")
        .select("*", { count: "exact" })
        .eq("post_id", postId);

      if (error) throw error;

      const userLiked = user ? data.some((like) => like.user_id === user.id) : false;
      return { count: count || 0, userLiked };
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      if (likesData?.userLiked) {
        const { error } = await supabase
          .from("blog_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_likes")
          .insert({ post_id: postId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-likes", postId] });
    },
    onError: () => {
      toast.error("Erro ao processar curtida");
    },
  });

  const handleLike = () => {
    if (!user) {
      toast.error("Faça login para curtir");
      return;
    }
    likeMutation.mutate();
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleLike}
        disabled={likeMutation.isPending}
        className={cn(
          "flex items-center gap-1.5 text-sm transition-colors",
          likesData?.userLiked
            ? "text-red-500"
            : "text-muted-foreground hover:text-red-500"
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all",
            likesData?.userLiked && "fill-current"
          )}
        />
        <span>{likesData?.count || 0}</span>
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={likeMutation.isPending}
      className={cn(
        "gap-2 transition-colors",
        likesData?.userLiked && "text-red-500 border-red-500/50 hover:bg-red-500/10"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          likesData?.userLiked && "fill-current"
        )}
      />
      <span>{likesData?.count || 0}</span>
      <span className="hidden sm:inline">
        {likesData?.userLiked ? "Curtido" : "Curtir"}
      </span>
    </Button>
  );
};

export default BlogLikeButton;
