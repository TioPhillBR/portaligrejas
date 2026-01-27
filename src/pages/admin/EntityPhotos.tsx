import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Trash2, GripVertical, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";

interface EntityPhoto {
  id: string;
  entity_type: string;
  entity_id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  sort_order: number;
}

const AdminEntityPhotos = () => {
  const { entityType, entityId } = useParams<{ entityType: string; entityId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { uploadImage, uploading, progress } = useImageUpload({ folder: `${entityType}-photos` });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    image_url: "",
    title: "",
    description: "",
  });
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const { data: entity } = useQuery({
    queryKey: [entityType, entityId],
    queryFn: async () => {
      const table = entityType === "event" ? "events" : "ministries";
      const nameField = entityType === "event" ? "title" : "name";
      
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", entityId!)
        .maybeSingle();

      if (error) throw error;
      return { ...data, displayName: data?.[nameField] || "Sem nome" };
    },
    enabled: !!entityId && !!entityType,
  });

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["entity-photos", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entity_photos")
        .select("*")
        .eq("entity_type", entityType!)
        .eq("entity_id", entityId!)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as EntityPhoto[];
    },
    enabled: !!entityId && !!entityType,
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("entity_photos").insert({
        entity_type: entityType,
        entity_id: entityId,
        image_url: data.image_url,
        title: data.title || null,
        description: data.description || null,
        sort_order: photos.length,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-photos", entityType, entityId] });
      toast.success("Foto adicionada!");
      setIsDialogOpen(false);
      setFormData({ image_url: "", title: "", description: "" });
    },
    onError: () => {
      toast.error("Erro ao adicionar foto");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase.from("entity_photos").delete().eq("id", photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-photos", entityType, entityId] });
      toast.success("Foto removida!");
    },
    onError: () => {
      toast.error("Erro ao remover foto");
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (orderedPhotos: EntityPhoto[]) => {
      const updates = orderedPhotos.map((photo, index) => ({
        id: photo.id,
        entity_type: photo.entity_type,
        entity_id: photo.entity_id,
        image_url: photo.image_url,
        title: photo.title,
        description: photo.description,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("entity_photos")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entity-photos", entityType, entityId] });
    },
  });

  const handleDragStart = (photoId: string) => {
    setDraggedItem(photoId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) return;

    const currentIndex = photos.findIndex((p) => p.id === draggedItem);
    const targetIndex = photos.findIndex((p) => p.id === targetId);

    if (currentIndex === -1 || targetIndex === -1) return;

    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(currentIndex, 1);
    newPhotos.splice(targetIndex, 0, removed);

    queryClient.setQueryData(["entity-photos", entityType, entityId], newPhotos);
  };

  const handleDragEnd = () => {
    if (draggedItem) {
      updateOrderMutation.mutate(photos);
    }
    setDraggedItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image_url) {
      toast.error("Selecione uma imagem");
      return;
    }
    addPhotoMutation.mutate(formData);
  };

  const entityLabel = entityType === "event" ? "Evento" : "Ministério";
  const backLink = entityType === "event" ? "/admin/eventos" : "/admin/ministerios";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to={backLink}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-display font-bold text-foreground">
            Galeria de Fotos
          </h1>
          <p className="text-muted-foreground mt-1">
            {entityLabel}: {entity?.displayName || "Carregando..."}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Foto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Foto</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Imagem</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url || "" })}
                  onUpload={uploadImage}
                  uploading={uploading}
                  progress={progress}
                  aspectRatio="square"
                />
              </div>
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Descrição breve da foto"
                />
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais"
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading || addPhotoMutation.isPending}>
                Adicionar Foto
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando...</div>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma foto na galeria</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Adicionar Foto" para começar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(photo.id)}
              onDragOver={(e) => handleDragOver(e, photo.id)}
              onDragEnd={handleDragEnd}
              className={`group cursor-move transition-opacity ${
                draggedItem === photo.id ? "opacity-50" : ""
              }`}
            >
              <CardContent className="p-2">
                <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Foto"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm("Remover esta foto?")) {
                          deletePhotoMutation.mutate(photo.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded p-1">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
                {photo.title && (
                  <p className="text-sm font-medium truncate">{photo.title}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Arraste as fotos para reordenar a galeria
      </p>
    </div>
  );
};

export default AdminEntityPhotos;
