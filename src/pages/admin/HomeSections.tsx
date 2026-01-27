import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
  ExternalLink,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
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
import { Link } from "react-router-dom";

interface HomeSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, any>;
  is_visible: boolean;
  sort_order: number;
}

interface AboutTab {
  id: string;
  label: string;
  icon: string;
  title: string;
  content?: string;
  values?: string[];
}

interface ContactInfo {
  icon: string;
  title: string;
  content: string;
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

const iconOptions = ["History", "Target", "Eye", "Heart", "MapPin", "Phone", "Mail", "Clock", "Calendar", "Users", "Music", "Book"];

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

  // About tabs management
  const updateAboutTab = (tabIndex: number, field: string, value: any) => {
    const tabs = [...(formData.content.tabs || [])];
    tabs[tabIndex] = { ...tabs[tabIndex], [field]: value };
    updateContent("tabs", tabs);
  };

  const addAboutTabValue = (tabIndex: number) => {
    const tabs = [...(formData.content.tabs || [])];
    const currentValues = tabs[tabIndex].values || [];
    tabs[tabIndex] = { ...tabs[tabIndex], values: [...currentValues, ""] };
    updateContent("tabs", tabs);
  };

  const updateAboutTabValue = (tabIndex: number, valueIndex: number, value: string) => {
    const tabs = [...(formData.content.tabs || [])];
    const values = [...(tabs[tabIndex].values || [])];
    values[valueIndex] = value;
    tabs[tabIndex] = { ...tabs[tabIndex], values };
    updateContent("tabs", tabs);
  };

  const removeAboutTabValue = (tabIndex: number, valueIndex: number) => {
    const tabs = [...(formData.content.tabs || [])];
    const values = [...(tabs[tabIndex].values || [])];
    values.splice(valueIndex, 1);
    tabs[tabIndex] = { ...tabs[tabIndex], values };
    updateContent("tabs", tabs);
  };

  // Contact info management
  const updateContactInfo = (index: number, field: string, value: string) => {
    const info = [...(formData.content.info || [])];
    info[index] = { ...info[index], [field]: value };
    updateContent("info", info);
  };

  const addContactInfo = () => {
    const info = [...(formData.content.info || [])];
    info.push({ icon: "MapPin", title: "", content: "" });
    updateContent("info", info);
  };

  const removeContactInfo = (index: number) => {
    const info = [...(formData.content.info || [])];
    info.splice(index, 1);
    updateContent("info", info);
  };

  // Gallery categories management
  const updateCategory = (index: number, value: string) => {
    const categories = [...(formData.content.categories || [])];
    categories[index] = value;
    updateContent("categories", categories);
  };

  const addCategory = () => {
    const categories = [...(formData.content.categories || [])];
    categories.push("");
    updateContent("categories", categories);
  };

  const removeCategory = (index: number) => {
    const categories = [...(formData.content.categories || [])];
    categories.splice(index, 1);
    updateContent("categories", categories);
  };

  const renderContentEditor = (sectionKey: string) => {
    switch (sectionKey) {
      case "hero":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge (texto superior)</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: ✦ Bem-vindo à nossa família ✦"
              />
            </div>
            <div className="space-y-2">
              <Label>Slogan / Versículo</Label>
              <Textarea
                value={formData.content.slogan || ""}
                onChange={(e) => updateContent("slogan", e.target.value)}
                placeholder="Ex: Porque Deus amou o mundo..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Referência Bíblica</Label>
              <Input
                value={formData.content.bible_reference || ""}
                onChange={(e) => updateContent("bible_reference", e.target.value)}
                placeholder="Ex: João 3:16"
              />
            </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Botão 1 - Texto</Label>
                <Input
                  value={formData.content.cta_button_1_text || ""}
                  onChange={(e) => updateContent("cta_button_1_text", e.target.value)}
                  placeholder="Ex: Conheça Nossa Igreja"
                />
              </div>
              <div className="space-y-2">
                <Label>Botão 1 - Link</Label>
                <Input
                  value={formData.content.cta_button_1_link || ""}
                  onChange={(e) => updateContent("cta_button_1_link", e.target.value)}
                  placeholder="Ex: #about"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Botão 2 - Texto</Label>
                <Input
                  value={formData.content.cta_button_2_text || ""}
                  onChange={(e) => updateContent("cta_button_2_text", e.target.value)}
                  placeholder="Ex: Nossos Horários"
                />
              </div>
              <div className="space-y-2">
                <Label>Botão 2 - Link</Label>
                <Input
                  value={formData.content.cta_button_2_link || ""}
                  onChange={(e) => updateContent("cta_button_2_link", e.target.value)}
                  placeholder="Ex: #services"
                />
              </div>
            </div>
          </div>
        );

      case "about":
        const tabs: AboutTab[] = formData.content.tabs || [];
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Quem Somos"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Abas</Label>
              <Accordion type="multiple" className="w-full">
                {tabs.map((tab, tabIndex) => (
                  <AccordionItem key={tab.id} value={tab.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <span className="text-sm">{tab.label || `Aba ${tabIndex + 1}`}</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Label da Aba</Label>
                          <Input
                            value={tab.label}
                            onChange={(e) => updateAboutTab(tabIndex, "label", e.target.value)}
                            placeholder="Ex: Nossa História"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ícone</Label>
                          <select
                            value={tab.icon}
                            onChange={(e) => updateAboutTab(tabIndex, "icon", e.target.value)}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            {iconOptions.map((icon) => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Título</Label>
                        <Input
                          value={tab.title}
                          onChange={(e) => updateAboutTab(tabIndex, "title", e.target.value)}
                        />
                      </div>
                      
                      {tab.id === "valores" ? (
                        <div className="space-y-2">
                          <Label className="text-xs">Valores (lista)</Label>
                          {(tab.values || []).map((value, valueIndex) => (
                            <div key={valueIndex} className="flex gap-2">
                              <Input
                                value={value}
                                onChange={(e) => updateAboutTabValue(tabIndex, valueIndex, e.target.value)}
                                placeholder={`Valor ${valueIndex + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeAboutTabValue(tabIndex, valueIndex)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAboutTabValue(tabIndex)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar Valor
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Label className="text-xs">Conteúdo</Label>
                          <Textarea
                            value={tab.content || ""}
                            onChange={(e) => updateAboutTab(tabIndex, "content", e.target.value)}
                            rows={4}
                          />
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        );

      case "services":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Programação"
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
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Os horários de culto são gerenciados em uma página separada.
              </p>
              <Link to="/admin/horarios">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar Horários
                </Button>
              </Link>
            </div>
          </div>
        );

      case "events":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Próximos Eventos"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texto do Botão</Label>
                <Input
                  value={formData.content.button_text || ""}
                  onChange={(e) => updateContent("button_text", e.target.value)}
                  placeholder="Ex: Ver Todos os Eventos"
                />
              </div>
              <div className="space-y-2">
                <Label>Link do Botão</Label>
                <Input
                  value={formData.content.button_link || ""}
                  onChange={(e) => updateContent("button_link", e.target.value)}
                  placeholder="Ex: /eventos"
                />
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Os eventos são gerenciados em uma página separada.
              </p>
              <Link to="/admin/eventos">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar Eventos
                </Button>
              </Link>
            </div>
          </div>
        );

      case "ministries":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Servindo ao Senhor"
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
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Os ministérios são gerenciados em uma página separada.
              </p>
              <Link to="/admin/ministerios">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar Ministérios
                </Button>
              </Link>
            </div>
          </div>
        );

      case "gallery":
        const categories: string[] = formData.content.categories || [];
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Momentos Especiais"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Itens por Página</Label>
              <Input
                type="number"
                min={4}
                max={20}
                value={formData.content.items_per_page || 8}
                onChange={(e) => updateContent("items_per_page", parseInt(e.target.value) || 8)}
              />
            </div>
            <div className="space-y-2">
              <Label>Categorias (filtros)</Label>
              {categories.map((cat, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={cat}
                    onChange={(e) => updateCategory(index, e.target.value)}
                    placeholder={`Categoria ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(index)}
                    disabled={index === 0} // Keep "Todos"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addCategory}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Categoria
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                As fotos são gerenciadas em uma página separada.
              </p>
              <Link to="/admin/galeria">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Gerenciar Galeria
                </Button>
              </Link>
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

            {formData.content.video_id && (
              <div className="space-y-2">
                <Label>Pré-visualização</Label>
                <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                  <iframe
                    src={`https://www.youtube.com/embed/${formData.content.video_id}`}
                    title="Pré-visualização do vídeo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

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

      case "radio":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Ao Vivo"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome da Rádio</Label>
              <Input
                value={formData.content.radio_name || ""}
                onChange={(e) => updateContent("radio_name", e.target.value)}
                placeholder="Ex: Rádio Igreja Luz"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>URL do Stream</Label>
              <Input
                value={formData.content.stream_url || ""}
                onChange={(e) => updateContent("stream_url", e.target.value)}
                placeholder="Ex: https://stream.zeno.fm/..."
              />
            </div>
            {formData.content.stream_url && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs mb-2 block">Preview do Player</Label>
                <audio
                  controls
                  src={formData.content.stream_url}
                  className="w-full"
                />
              </div>
            )}
          </div>
        );

      case "donations":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Contribua"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Versículo</Label>
              <Textarea
                value={formData.content.bible_verse || ""}
                onChange={(e) => updateContent("bible_verse", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Referência Bíblica</Label>
              <Input
                value={formData.content.bible_reference || ""}
                onChange={(e) => updateContent("bible_reference", e.target.value)}
                placeholder="Ex: 2 Coríntios 9:7"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                Os dados bancários (PIX, conta) são gerenciados nas configurações.
              </p>
              <Link to="/admin/configuracoes">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Configurações
                </Button>
              </Link>
            </div>
          </div>
        );

      case "prayer":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Oração"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder do Campo</Label>
              <Input
                value={formData.content.placeholder || ""}
                onChange={(e) => updateContent("placeholder", e.target.value)}
                placeholder="Ex: Escreva seu pedido de oração..."
              />
            </div>
            <div className="space-y-2">
              <Label>Versículo</Label>
              <Textarea
                value={formData.content.bible_verse || ""}
                onChange={(e) => updateContent("bible_verse", e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Referência Bíblica</Label>
              <Input
                value={formData.content.bible_reference || ""}
                onChange={(e) => updateContent("bible_reference", e.target.value)}
                placeholder="Ex: Tiago 5:16"
              />
            </div>
          </div>
        );

      case "contact":
        const contactInfo: ContactInfo[] = formData.content.info || [];
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                value={formData.content.badge || ""}
                onChange={(e) => updateContent("badge", e.target.value)}
                placeholder="Ex: Fale Conosco"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.content.description || ""}
                onChange={(e) => updateContent("description", e.target.value)}
                rows={2}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Informações de Contato</Label>
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={info.icon}
                        onChange={(e) => updateContactInfo(index, "icon", e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {iconOptions.map((icon) => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                      <Input
                        value={info.title}
                        onChange={(e) => updateContactInfo(index, "title", e.target.value)}
                        placeholder="Título"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeContactInfo(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <Input
                      value={info.content}
                      onChange={(e) => updateContactInfo(index, "content", e.target.value)}
                      placeholder="Conteúdo"
                    />
                  </div>
                </Card>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addContactInfo}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Informação
              </Button>
            </div>

            <div className="space-y-2">
              <Label>URL do Mapa (embed)</Label>
              <Input
                value={formData.content.map_embed_url || ""}
                onChange={(e) => updateContent("map_embed_url", e.target.value)}
                placeholder="Ex: https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL do embed do Google Maps (src do iframe)
              </p>
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
          Personalize as seções da página inicial. Arraste para reordenar.
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
