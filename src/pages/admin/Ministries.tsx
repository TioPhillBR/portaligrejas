import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/admin/ImageUpload";
import { useDragReorder } from "@/hooks/useDragReorder";

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  image_url: string | null;
  leader_name: string | null;
  is_active: boolean;
  sort_order: number;
}

const icons = ["Music", "Users", "Heart", "Baby", "BookOpen", "Hand", "Star", "Mic", "Camera", "Globe"];
const colors = [
  { value: "from-blue-500 to-blue-600", label: "Azul" },
  { value: "from-purple-500 to-purple-600", label: "Roxo" },
  { value: "from-pink-500 to-pink-600", label: "Rosa" },
  { value: "from-orange-500 to-orange-600", label: "Laranja" },
  { value: "from-green-500 to-green-600", label: "Verde" },
  { value: "from-red-500 to-red-600", label: "Vermelho" },
  { value: "from-yellow-500 to-yellow-600", label: "Amarelo" },
  { value: "from-teal-500 to-teal-600", label: "Teal" },
];

const AdminMinistries = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const { uploadImage, uploading, progress } = useImageUpload({ folder: "ministries" });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Users",
    color: "from-blue-500 to-blue-600",
    image_url: "",
    leader_name: "",
    is_active: true,
  });

  const handleReorder = async (reorderedItems: Ministry[]) => {
    setMinistries(reorderedItems);

    const updates = reorderedItems.map((item) => ({
      id: item.id,
      sort_order: item.sort_order,
    }));

    for (const update of updates) {
      const { error } = await supabase
        .from("ministries")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id);

      if (error) {
        toast({ title: "Erro ao reordenar", variant: "destructive" });
        fetchMinistries();
        return;
      }
    }

    toast({ title: "Ordem atualizada!" });
  };

  const {
    draggedItem,
    dragOverIndex,
    droppedItemId,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useDragReorder({ items: ministries, onReorder: handleReorder });

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    const { data, error } = await supabase
      .from("ministries")
      .select("*")
      .order("sort_order");

    if (error) {
      toast({ title: "Erro ao carregar ministérios", variant: "destructive" });
    } else {
      setMinistries(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ministryData = {
      ...formData,
      image_url: formData.image_url || null,
      leader_name: formData.leader_name || null,
    };

    if (editingMinistry) {
      const { error } = await supabase
        .from("ministries")
        .update(ministryData)
        .eq("id", editingMinistry.id);

      if (error) {
        toast({ title: "Erro ao atualizar", variant: "destructive" });
      } else {
        toast({ title: "Ministério atualizado!" });
        fetchMinistries();
      }
    } else {
      const { error } = await supabase
        .from("ministries")
        .insert({ ...ministryData, sort_order: ministries.length });

      if (error) {
        toast({ title: "Erro ao criar", variant: "destructive" });
      } else {
        toast({ title: "Ministério criado!" });
        fetchMinistries();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setFormData({
      name: ministry.name,
      description: ministry.description || "",
      icon: ministry.icon,
      color: ministry.color,
      image_url: ministry.image_url || "",
      leader_name: ministry.leader_name || "",
      is_active: ministry.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ministério?")) return;

    const { error } = await supabase.from("ministries").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Ministério excluído!" });
      fetchMinistries();
    }
  };

  const resetForm = () => {
    setEditingMinistry(null);
    setFormData({
      name: "",
      description: "",
      icon: "Users",
      color: "from-blue-500 to-blue-600",
      image_url: "",
      leader_name: "",
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Ministérios</h1>
          <p className="text-muted-foreground mt-1">Gerencie os ministérios da igreja. Arraste para reordenar.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Ministério
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMinistry ? "Editar Ministério" : "Novo Ministério"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Imagem (opcional)</Label>
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url || "" })}
                  onUpload={uploadImage}
                  uploading={uploading}
                  progress={progress}
                  aspectRatio="video"
                />
              </div>
              <div>
                <Label>Nome do Ministério</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ministério de Louvor"
                  required
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Líder</Label>
                <Input
                  value={formData.leader_name}
                  onChange={(e) => setFormData({ ...formData, leader_name: e.target.value })}
                  placeholder="Nome do líder"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ícone</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {icons.map((icon) => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cor</Label>
                  <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded bg-gradient-to-r ${color.value}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Ativo</Label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {editingMinistry ? "Salvar Alterações" : "Criar Ministério"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando...</div>
      ) : ministries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhum ministério cadastrado
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {ministries.map((ministry, index) => (
            <Card
              key={ministry.id}
              draggable
              onDragStart={(e) => handleDragStart(e, ministry)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`transition-all duration-200 cursor-grab active:cursor-grabbing ${
                !ministry.is_active ? "opacity-50" : ""
              } ${draggedItem?.id === ministry.id ? "opacity-50 scale-95 rotate-1" : ""} ${
                dragOverIndex === index && draggedItem?.id !== ministry.id ? "ring-2 ring-primary ring-offset-2 translate-y-1" : ""
              } ${droppedItemId === ministry.id ? "animate-drop-success" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${ministry.color} flex items-center justify-center text-white font-bold`}>
                    {ministry.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{ministry.name}</h3>
                    {ministry.leader_name && (
                      <p className="text-sm text-muted-foreground">Líder: {ministry.leader_name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(ministry)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(ministry.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMinistries;
