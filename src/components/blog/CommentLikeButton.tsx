import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CommentLikeButtonProps {
  commentId: string;
}

const CommentLikeButton = ({ commentId }: CommentLikeButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likesData } = useQuery({
    queryKey: ["comment-likes", commentId],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("comment_likes")
        .select("*", { count: "exact" })
        .eq("comment_id", commentId);

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
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-likes", commentId] });
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

  return (
    <button
      onClick={handleLike}
      disabled={likeMutation.isPending}
      className={cn(
        "flex items-center gap-1 text-xs transition-colors",
        likesData?.userLiked
          ? "text-red-500"
          : "text-muted-foreground hover:text-red-500"
      )}
    >
      <Heart
        className={cn(
          "h-3.5 w-3.5 transition-all",
          likesData?.userLiked && "fill-current"
        )}
      />
      {(likesData?.count || 0) > 0 && <span>{likesData?.count}</span>}
    </button>
  );
};

export default CommentLikeButton;
