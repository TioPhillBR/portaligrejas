import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  ExternalLink,
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import ImageUpload from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image_url: string | null;
  category: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const AdminBlog = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    category: "Geral",
    category_id: "",
    is_published: false,
    is_featured: false,
    scheduled_at: null as Date | null,
  });
  const [scheduleTime, setScheduleTime] = useState("09:00");

  const { uploadImage, uploading, progress } = useImageUpload({
    bucket: "church-images",
    folder: "blog",
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_categories")
        .select("id, name, slug, color")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as BlogCategory[];
    },
  });

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const scheduledAt = data.scheduled_at 
        ? combineDateTime(data.scheduled_at, scheduleTime).toISOString()
        : null;
      
      const { error } = await supabase.from("blog_posts").insert({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.image_url,
        category: data.category,
        category_id: data.category_id || null,
        is_published: data.is_published && !scheduledAt,
        is_featured: data.is_featured,
        scheduled_at: scheduledAt,
        author_id: user?.id,
        published_at: data.is_published && !scheduledAt ? new Date().toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Artigo criado com sucesso!");
      resetForm();
    },
    onError: () => toast.error("Erro ao criar artigo"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const scheduledAt = data.scheduled_at 
        ? combineDateTime(data.scheduled_at, scheduleTime).toISOString()
        : null;
      
      const updateData = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        image_url: data.image_url,
        category: data.category,
        category_id: data.category_id || null,
        is_published: data.is_published && !scheduledAt,
        is_featured: data.is_featured,
        scheduled_at: scheduledAt,
        published_at: data.is_published && !scheduledAt && !editingPost?.published_at
          ? new Date().toISOString()
          : editingPost?.published_at,
      };
      const { error } = await supabase
        .from("blog_posts")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Artigo atualizado com sucesso!");
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar artigo"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Artigo excluído com sucesso!");
    },
    onError: () => toast.error("Erro ao excluir artigo"),
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          is_published,
          published_at: is_published ? new Date().toISOString() : null,
          scheduled_at: null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Status atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar status"),
  });

  const toggleFeatureMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({ is_featured })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Destaque atualizado!");
    },
    onError: () => toast.error("Erro ao atualizar destaque"),
  });

  const combineDateTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(":").map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      category: "Geral",
      category_id: "",
      is_published: false,
      is_featured: false,
      scheduled_at: null,
    });
    setScheduleTime("09:00");
    setEditingPost(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    const scheduledDate = post.scheduled_at ? new Date(post.scheduled_at) : null;
    if (scheduledDate) {
      setScheduleTime(format(scheduledDate, "HH:mm"));
    }
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      image_url: post.image_url || "",
      category: post.category || "Geral",
      category_id: post.category_id || "",
      is_published: post.is_published,
      is_featured: post.is_featured,
      scheduled_at: scheduledDate,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = categories?.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      category: category?.name || "Geral",
    }));
  };

  const getPostStatus = (post: BlogPost) => {
    if (post.is_published) return { label: "Publicado", variant: "default" as const, color: "bg-green-500" };
    if (post.scheduled_at) return { label: "Agendado", variant: "secondary" as const, color: "bg-blue-500" };
    return { label: "Rascunho", variant: "secondary" as const, color: "" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog</h1>
          <p className="text-muted-foreground">
            Gerencie os artigos do blog
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost ? "Editar Artigo" : "Novo Artigo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Imagem de Capa</Label>
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) =>
                      setFormData({ ...formData, image_url: url || "" })
                    }
                    onUpload={uploadImage}
                    uploading={uploading}
                    progress={progress}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumo</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Breve descrição do artigo..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) =>
                    setFormData({ ...formData, content })
                  }
                  placeholder="Escreva o conteúdo do artigo..."
                />
              </div>

              {/* Scheduling Section */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium">Agendamento de Publicação</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.scheduled_at && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.scheduled_at
                            ? format(formData.scheduled_at, "dd/MM/yyyy", { locale: ptBR })
                            : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.scheduled_at || undefined}
                          onSelect={(date) =>
                            setFormData({ ...formData, scheduled_at: date || null })
                          }
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      disabled={!formData.scheduled_at}
                    />
                  </div>
                </div>
                {formData.scheduled_at && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      O artigo será publicado em{" "}
                      {format(combineDateTime(formData.scheduled_at, scheduleTime), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, scheduled_at: null })}
                    >
                      Limpar
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_published: checked, scheduled_at: checked ? null : formData.scheduled_at })
                    }
                    disabled={!!formData.scheduled_at}
                  />
                  <Label htmlFor="is_published">Publicar agora</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_featured: checked })
                    }
                  />
                  <Label htmlFor="is_featured">Destaque</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPost ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border">
          <p className="text-muted-foreground mb-4">
            Nenhum artigo cadastrado
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Artigo
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => {
                const status = getPostStatus(post);
                return (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {post.image_url && (
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-sm text-muted-foreground">
                            /{post.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{post.category || "Geral"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={status.color}>{status.label}</Badge>
                        {post.is_featured && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                      {post.scheduled_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(post.scheduled_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {post.published_at
                        ? format(new Date(post.published_at), "dd/MM/yyyy", { locale: ptBR })
                        : format(new Date(post.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            togglePublishMutation.mutate({
                              id: post.id,
                              is_published: !post.is_published,
                            })
                          }
                          title={post.is_published ? "Despublicar" : "Publicar"}
                        >
                          {post.is_published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleFeatureMutation.mutate({
                              id: post.id,
                              is_featured: !post.is_featured,
                            })
                          }
                          title={post.is_featured ? "Remover destaque" : "Destacar"}
                        >
                          {post.is_featured ? (
                            <StarOff className="h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                        {post.is_published && (
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            title="Ver no site"
                          >
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir artigo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O artigo será
                                removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(post.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
