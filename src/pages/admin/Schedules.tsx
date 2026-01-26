import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ServiceSchedule {
  id: string;
  day_of_week: string;
  time: string;
  name: string;
  icon: string;
  sort_order: number;
}

const daysOfWeek = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
const icons = ["Users", "Heart", "BookOpen", "Music", "Baby", "Hand", "Star"];

const AdminSchedules = () => {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ServiceSchedule | null>(null);
  
  const [formData, setFormData] = useState({
    day_of_week: "Domingo",
    time: "",
    name: "",
    icon: "Users",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from("service_schedules")
      .select("*")
      .order("sort_order");

    if (error) {
      toast({ title: "Erro ao carregar horários", variant: "destructive" });
    } else {
      setSchedules(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSchedule) {
      const { error } = await supabase
        .from("service_schedules")
        .update(formData)
        .eq("id", editingSchedule.id);

      if (error) {
        toast({ title: "Erro ao atualizar", variant: "destructive" });
      } else {
        toast({ title: "Horário atualizado com sucesso!" });
        fetchSchedules();
      }
    } else {
      const { error } = await supabase
        .from("service_schedules")
        .insert({ ...formData, sort_order: schedules.length });

      if (error) {
        toast({ title: "Erro ao criar", variant: "destructive" });
      } else {
        toast({ title: "Horário criado com sucesso!" });
        fetchSchedules();
      }
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (schedule: ServiceSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      day_of_week: schedule.day_of_week,
      time: schedule.time,
      name: schedule.name,
      icon: schedule.icon,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este horário?")) return;

    const { error } = await supabase
      .from("service_schedules")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } else {
      toast({ title: "Horário excluído com sucesso!" });
      fetchSchedules();
    }
  };

  const resetForm = () => {
    setEditingSchedule(null);
    setFormData({ day_of_week: "Domingo", time: "", name: "", icon: "Users" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Horários de Culto
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os horários dos cultos e atividades
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Horário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? "Editar Horário" : "Novo Horário"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Dia da Semana</Label>
                <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Horário</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Nome do Culto/Atividade</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Culto da Família"
                  required
                />
              </div>
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
              <Button type="submit" className="w-full">
                {editingSchedule ? "Salvar Alterações" : "Criar Horário"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Carregando...</div>
          ) : schedules.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum horário cadastrado
            </div>
          ) : (
            <div className="divide-y divide-border">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="font-medium">{schedule.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {schedule.day_of_week} às {schedule.time}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchedules;
