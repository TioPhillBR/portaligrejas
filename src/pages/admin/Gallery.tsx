import { useEffect, useState } from "react";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/admin/ImageUpload";

interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  category: string;
  is_active: boolean;
}

const categories = ["Cultos", "Eventos", "Batismos", "Conferências", "Jovens", "Geral"];

const AdminGallery = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { uploadImage, deleteImage, uploading, progress } = useImageUpload({ folder: "gallery" });

  const [formData, setFormData] = useState({
    image_url: "",
    title: "",
    description: "",
    category: "Geral",
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar galeria", variant: "destructive" });
    } else {
      setGallery(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("gallery").insert({
      image_url: formData.image_url,
      title: formData.title || null,
      description: formData.description || null,
      category: formData.category,
    });

    if (error) {
      toast({ title: "Erro ao adicionar foto", variant: "destructive" });
    } else {
      toast({ title: "Foto adicionada!" });
      fetchGallery();
      resetForm();
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm("Tem certeza que deseja excluir esta foto?")) return;

    // Delete from storage
    await deleteImage(item.image_url);

    // Delete from database
    const { error } = await supabase.from("gallery").delete().eq("id", item.id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Foto excluída!" });
      fetchGallery();
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: "",
      title: "",
      description: "",
      category: "Geral",
    });
  };

  const filteredGallery = selectedCategory === "all"
    ? gallery
    : gallery.filter((item) => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Galeria de Fotos</h1>
          <p className="text-muted-foreground mt-1">Gerencie as fotos da igreja</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Foto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Foto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Foto</Label>
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
                    placeholder="Ex: Culto de Domingo"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={uploading || !formData.image_url}>
                  Adicionar Foto
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Carregando...</div>
      ) : filteredGallery.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            Nenhuma foto encontrada
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title || "Foto da galeria"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                {item.title && (
                  <span className="text-white text-sm font-medium text-center px-2">{item.title}</span>
                )}
                <span className="text-white/70 text-xs">{item.category}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
