import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Check,
  X,
  Trash2,
  MessageSquare,
  Clock,
  CheckCircle,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  is_approved: boolean;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  post?: {
    title: string;
    slug: string;
  };
}

const AdminComments = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "all">("pending");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["admin-comments", filter],
    queryFn: async () => {
      let query = supabase
        .from("blog_comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("is_approved", false);
      } else if (filter === "approved") {
        query = query.eq("is_approved", true);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles and posts
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const postIds = [...new Set(data.map((c) => c.post_id))];

      const [profilesRes, postsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds),
        supabase
          .from("blog_posts")
          .select("id, title, slug")
          .in("id", postIds),
      ]);

      const profileMap = new Map(
        profilesRes.data?.map((p) => [p.user_id, p]) || []
      );
      const postMap = new Map(postsRes.data?.map((p) => [p.id, p]) || []);

      return data.map((comment) => ({
        ...comment,
        profile: profileMap.get(comment.user_id),
        post: postMap.get(comment.post_id),
      })) as Comment[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({
      id,
      approve,
    }: {
      id: string;
      approve: boolean;
    }) => {
      const { error } = await supabase
        .from("blog_comments")
        .update({ is_approved: approve })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success(approve ? "Comentário aprovado!" : "Comentário rejeitado!");
    },
    onError: () => toast.error("Erro ao atualizar comentário"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_comments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comentário excluído!");
    },
    onError: () => toast.error("Erro ao excluir comentário"),
  });

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const pendingCount = comments?.filter((c) => !c.is_approved).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Moderação de Comentários</h1>
          <p className="text-muted-foreground">
            Aprove ou rejeite comentários antes de serem publicados
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Aprovados
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Filter className="h-4 w-4" />
            Todos
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : comments?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {filter === "pending"
                    ? "Nenhum comentário pendente"
                    : "Nenhum comentário encontrado"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments?.map((comment) => (
                <Card key={comment.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={comment.profile?.avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {getInitials(comment.profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">
                            {comment.profile?.full_name || "Usuário"}
                          </CardTitle>
                          <CardDescription>
                            {format(
                              new Date(comment.created_at),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR }
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={comment.is_approved ? "default" : "secondary"}
                      >
                        {comment.is_approved ? "Aprovado" : "Pendente"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {comment.post && (
                      <p className="text-sm text-muted-foreground">
                        Em:{" "}
                        <a
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {comment.post.title}
                        </a>
                      </p>
                    )}
                    <p className="text-foreground whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {!comment.is_approved && (
                        <Button
                          size="sm"
                          onClick={() =>
                            approveMutation.mutate({
                              id: comment.id,
                              approve: true,
                            })
                          }
                          disabled={approveMutation.isPending}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Aprovar
                        </Button>
                      )}
                      {comment.is_approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            approveMutation.mutate({
                              id: comment.id,
                              approve: false,
                            })
                          }
                          disabled={approveMutation.isPending}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Revogar
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Excluir
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Excluir comentário?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. O comentário será
                              removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(comment.id)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminComments;
