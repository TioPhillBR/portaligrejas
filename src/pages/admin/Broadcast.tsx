import { useEffect, useState } from "react";
import { Send, Users, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useImageUpload } from "@/hooks/useImageUpload";
import ImageUpload from "@/components/admin/ImageUpload";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Ministry {
  id: string;
  name: string;
}

interface BroadcastMessage {
  id: string;
  title: string | null;
  content: string;
  target_type: string;
  target_value: string | null;
  message_type: string;
  media_url: string | null;
  created_at: string;
}

const AdminBroadcast = () => {
  const { user } = useAuth();
  const { uploadImage, uploading, progress } = useImageUpload({ folder: "broadcasts" });
  
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [recentBroadcasts, setRecentBroadcasts] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetType: "all",
    targetValue: "",
    mediaUrl: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    updateMemberCount();
  }, [formData.targetType, formData.targetValue]);

  const fetchData = async () => {
    // Fetch ministries
    const { data: ministriesData } = await supabase
      .from("ministries")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (ministriesData) {
      setMinistries(ministriesData);
    }

    // Fetch recent broadcasts
    const { data: broadcastsData } = await supabase
      .from("broadcast_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (broadcastsData) {
      setRecentBroadcasts(broadcastsData);
    }

    setLoading(false);
  };

  const updateMemberCount = async () => {
    let query = supabase.from("profiles").select("id", { count: "exact" });

    if (formData.targetType === "gender" && formData.targetValue) {
      query = query.eq("gender", formData.targetValue);
    } else if (formData.targetType === "ministry" && formData.targetValue) {
      const { count } = await supabase
        .from("ministry_members")
        .select("id", { count: "exact" })
        .eq("ministry_id", formData.targetValue)
        .eq("is_active", true);
      setMemberCount(count || 0);
      return;
    }

    const { count } = await query;
    setMemberCount(count || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.content.trim()) return;

    setSending(true);

    const { error } = await supabase.from("broadcast_messages").insert({
      sender_id: user.id,
      title: formData.title || null,
      content: formData.content,
      target_type: formData.targetType,
      target_value: formData.targetType !== "all" ? formData.targetValue : null,
      message_type: formData.mediaUrl ? "image" : "text",
      media_url: formData.mediaUrl || null,
    });

    if (error) {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } else {
      toast({ title: "Aviso enviado com sucesso!" });
      setFormData({
        title: "",
        content: "",
        targetType: "all",
        targetValue: "",
        mediaUrl: "",
      });
      fetchData();
    }

    setSending(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aviso?")) return;

    const { error } = await supabase.from("broadcast_messages").delete().eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Aviso excluído!" });
      fetchData();
    }
  };

  const getTargetLabel = (targetType: string, targetValue: string | null) => {
    switch (targetType) {
      case "all":
        return "Todos os membros";
      case "ministry":
        const ministry = ministries.find((m) => m.id === targetValue);
        return ministry ? `Ministério: ${ministry.name}` : "Ministério";
      case "gender":
        return targetValue === "masculino" ? "Homens" : "Mulheres";
      case "age_range":
        const labels: Record<string, string> = {
          jovem: "Jovens (13-30 anos)",
          adulto: "Adultos (31-50 anos)",
          terceira_idade: "Terceira Idade (50+)",
        };
        return labels[targetValue || ""] || targetValue;
      default:
        return targetType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Comunicação</h1>
        <p className="text-muted-foreground mt-1">
          Envie avisos segmentados para os membros da igreja
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Novo Aviso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Selection */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="w-4 h-4" />
                  Segmentação
                </div>

                <div>
                  <Label>Enviar para</Label>
                  <Select
                    value={formData.targetType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, targetType: value, targetValue: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os membros</SelectItem>
                      <SelectItem value="ministry">Por ministério</SelectItem>
                      <SelectItem value="gender">Por gênero</SelectItem>
                      <SelectItem value="age_range">Por faixa etária</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.targetType === "ministry" && (
                  <div>
                    <Label>Ministério</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ministério" />
                      </SelectTrigger>
                      <SelectContent>
                        {ministries.map((ministry) => (
                          <SelectItem key={ministry.id} value={ministry.id}>
                            {ministry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.targetType === "gender" && (
                  <div>
                    <Label>Gênero</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.targetType === "age_range" && (
                  <div>
                    <Label>Faixa Etária</Label>
                    <Select
                      value={formData.targetValue}
                      onValueChange={(value) =>
                        setFormData({ ...formData, targetValue: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jovem">Jovens (13-30 anos)</SelectItem>
                        <SelectItem value="adulto">Adultos (31-50 anos)</SelectItem>
                        <SelectItem value="terceira_idade">Terceira Idade (50+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {memberCount !== null && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Aproximadamente <strong>{memberCount}</strong> membros serão alcançados
                    </span>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div>
                <Label>Título (opcional)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título do aviso"
                />
              </div>

              <div>
                <Label>Mensagem *</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Digite a mensagem do aviso..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Imagem (opcional)</Label>
                <ImageUpload
                  value={formData.mediaUrl}
                  onChange={(url) => setFormData({ ...formData, mediaUrl: url || "" })}
                  onUpload={uploadImage}
                  uploading={uploading}
                  progress={progress}
                  aspectRatio="video"
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={sending || uploading || !formData.content.trim()}
              >
                <Send className="w-4 h-4" />
                {sending ? "Enviando..." : "Enviar Aviso"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Broadcasts */}
        <Card>
          <CardHeader>
            <CardTitle>Avisos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentBroadcasts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum aviso enviado ainda
              </div>
            ) : (
              <div className="space-y-4">
                {recentBroadcasts.map((broadcast) => (
                  <div
                    key={broadcast.id}
                    className="p-4 border border-border rounded-lg space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {broadcast.title && (
                          <h4 className="font-medium">{broadcast.title}</h4>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {broadcast.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive shrink-0"
                        onClick={() => handleDelete(broadcast.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {getTargetLabel(broadcast.target_type, broadcast.target_value)}
                      </Badge>
                      <span>•</span>
                      <span>
                        {format(new Date(broadcast.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminBroadcast;
