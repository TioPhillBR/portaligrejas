import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Save,
  X,
  Image,
  Type,
  Settings2,
} from "lucide-react";
import { useDragReorder } from "@/hooks/useDragReorder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ImageUpload from "@/components/admin/ImageUpload";
import { useImageUpload } from "@/hooks/useImageUpload";

interface HomeSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
}

const sectionLabels: Record<string, string> = {
  hero: "Banner Principal",
  about: "Sobre / Institucional",
  services: "Horários de Culto",
  events: "Eventos",
  ministries: "Ministérios",
  gallery: "Galeria",
  video: "Vídeo Institucional",
  radio: "Web Rádio",
  donations: "Doações",
  prayer: "Pedidos de Oração",
  contact: "Contato",
};

const AdminHomeSections = () => {
  const queryClient = useQueryClient();
  const [editingSection, setEditingSection] = useState<HomeSection | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    content: Record<string, any>;
  }>({ title: "", subtitle: "", content: {} });

  const { uploadImage, uploading, progress } = useImageUpload({
    bucket: "church-images",
    folder: "home",
  });

  const { data: sections, isLoading } = useQuery({
    queryKey: ["home-sections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_sections")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as HomeSection[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<HomeSection>;
    }) => {
      const { error } = await supabase
        .from("home_sections")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
      toast.success("Seção atualizada!");
      setEditingSection(null);
    },
    onError: () => toast.error("Erro ao atualizar seção"),
  });

  const reorderMutation = useMutation({
    mutationFn: async (items: HomeSection[]) => {
      const updates = items.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }));
      
      for (const update of updates) {
        const { error } = await supabase
          .from("home_sections")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-sections"] });
      toast.success("Ordem atualizada!");
    },
    onError: () => toast.error("Erro ao reordenar seções"),
  });

  const {
    draggedItem,
    dragOverIndex,
    droppedItemId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragReorder({
    items: sections || [],
    onReorder: async (items) => {
      await reorderMutation.mutateAsync(items);
    },
  });

  const toggleVisibility = (section: HomeSection) => {
    updateMutation.mutate({
      id: section.id,
      updates: { is_visible: !section.is_visible },
    });
  };

  const openEditDialog = (section: HomeSection) => {
    setEditingSection(section);
    setFormData({
      title: section.title || "",
      subtitle: section.subtitle || "",
      content: section.content || {},
    });
  };

  const handleSave = () => {
    if (!editingSection) return;
    updateMutation.mutate({
      id: editingSection.id,
      updates: {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
      },
    });
  };

  const updateContent = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      content: { ...prev.content, [key]: value },
    }));
  };

  const renderContentEditor = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Imagem de Fundo</Label>
              <ImageUpload
                value={formData.content.background_image || ""}
                onChange={(url) => updateContent("background_image", url || "")}
                onUpload={uploadImage}
                uploading={uploading}
                progress={progress}
              />
            </div>
            <div className="space-y-2">
              <Label>Texto do Botão</Label>
              <Input
                value={formData.content.cta_text || ""}
                onChange={(e) => updateContent("cta_text", e.target.value)}
                placeholder="Ex: Conheça Nossa Igreja"
              />
            </div>
            <div className="space-y-2">
              <Label>Link do Botão</Label>
              <Input
                value={formData.content.cta_link || ""}
                onChange={(e) => updateContent("cta_link", e.target.value)}
                placeholder="Ex: #about"
              />
            </div>
          </div>
        );

      case "about":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Missão</Label>
              <Textarea
                value={formData.content.mission || ""}
                onChange={(e) => updateContent("mission", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Visão</Label>
              <Textarea
                value={formData.content.vision || ""}
                onChange={(e) => updateContent("vision", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Valores (separados por vírgula)</Label>
              <Input
                value={(formData.content.values || []).join(", ")}
                onChange={(e) =>
                  updateContent(
                    "values",
                    e.target.value.split(",").map((v) => v.trim())
                  )
                }
                placeholder="Fé, Amor, Comunhão"
              />
            </div>
          </div>
        );

      case "donations":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título da Seção</Label>
              <Input
                value={formData.content.title || ""}
                onChange={(e) => updateContent("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      case "video":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID do Vídeo do YouTube *</Label>
              <Input
                value={formData.content.video_id || ""}
                onChange={(e) => updateContent("video_id", e.target.value)}
                placeholder="Ex: dQw4w9WgXcQ"
              />
              <p className="text-xs text-muted-foreground">
                O ID é a parte final da URL do YouTube. Ex: youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>URL da Thumbnail (opcional)</Label>
              <Input
                value={formData.content.thumbnail_url || ""}
                onChange={(e) => updateContent("thumbnail_url", e.target.value)}
                placeholder="Deixe vazio para usar a thumbnail do YouTube"
              />
            </div>
            <div className="space-y-2">
              <Label>Título do Vídeo</Label>
              <Input
                value={formData.content.video_title || ""}
                onChange={(e) => updateContent("video_title", e.target.value)}
                placeholder="Ex: Igreja Luz do Evangelho"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição do Vídeo</Label>
              <Input
                value={formData.content.video_description || ""}
                onChange={(e) => updateContent("video_description", e.target.value)}
                placeholder="Ex: Transformando vidas desde 1985"
              />
            </div>
          </div>
        );

      case "prayer":
      case "contact":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            Esta seção utiliza dados dinâmicos do banco de dados e não possui
            configurações adicionais de conteúdo.
          </p>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seções da Home</h1>
        <p className="text-muted-foreground">
          Personalize as seções da página inicial
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sections?.map((section, index) => (
            <Card
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 ${
                draggedItem?.id === section.id ? "opacity-50 scale-95" : ""
              } ${
                dragOverIndex === index && draggedItem?.id !== section.id
                  ? "border-primary border-2 shadow-lg"
                  : ""
              } ${
                droppedItemId === section.id
                  ? "animate-[bounce_0.4s_ease-out] ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
            >
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                    <div>
                      <CardTitle className="text-base">
                        {sectionLabels[section.section_key] || section.section_key}
                      </CardTitle>
                      <CardDescription>
                        {section.title || "Sem título personalizado"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(section)}
                      title={section.is_visible ? "Ocultar" : "Exibir"}
                    >
                      {section.is_visible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(section)}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!editingSection}
        onOpenChange={(open) => !open && setEditingSection(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar:{" "}
              {editingSection
                ? sectionLabels[editingSection.section_key] ||
                  editingSection.section_key
                : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="basic">
              <AccordionItem value="basic">
                <AccordionTrigger className="gap-2">
                  <Type className="h-4 w-4" />
                  Textos Básicos
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Título da seção"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={formData.subtitle}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitle: e.target.value })
                      }
                      placeholder="Subtítulo ou descrição curta"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content">
                <AccordionTrigger className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Conteúdo Específico
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {editingSection && renderContentEditor(editingSection.section_key)}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomeSections;
