import { useEffect, useState } from "react";
import { Users, Check, UserPlus, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  color: string;
  image_url: string | null;
  leader_name: string | null;
}

const MemberMinistries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch all active ministries
    const { data: ministriesData } = await supabase
      .from("ministries")
      .select("id, name, description, color, image_url, leader_name")
      .eq("is_active", true)
      .order("sort_order");

    if (ministriesData) {
      setMinistries(ministriesData);
    }

    // Fetch my memberships
    const { data: membershipsData } = await supabase
      .from("ministry_members")
      .select("ministry_id")
      .eq("user_id", user.id)
      .eq("is_active", true);

    if (membershipsData) {
      setMyMemberships(new Set(membershipsData.map((m) => m.ministry_id)));
    }

    setLoading(false);
  };

  const handleJoin = async (ministryId: string) => {
    if (!user) return;
    setActionLoading(ministryId);

    const { error } = await supabase
      .from("ministry_members")
      .insert({
        user_id: user.id,
        ministry_id: ministryId,
      });

    if (error) {
      if (error.code === "23505") {
        // Already a member, reactivate
        const { error: updateError } = await supabase
          .from("ministry_members")
          .update({ is_active: true })
          .eq("user_id", user.id)
          .eq("ministry_id", ministryId);

        if (updateError) {
          toast({ title: "Erro ao participar", variant: "destructive" });
        } else {
          toast({ title: "Você entrou no ministério!" });
          setMyMemberships((prev) => new Set([...prev, ministryId]));
        }
      } else {
        toast({ title: "Erro ao participar", variant: "destructive" });
      }
    } else {
      toast({ title: "Você entrou no ministério!" });
      setMyMemberships((prev) => new Set([...prev, ministryId]));
    }

    setActionLoading(null);
  };

  const handleLeave = async (ministryId: string) => {
    if (!user) return;
    setActionLoading(ministryId);

    const { error } = await supabase
      .from("ministry_members")
      .update({ is_active: false })
      .eq("user_id", user.id)
      .eq("ministry_id", ministryId);

    if (error) {
      toast({ title: "Erro ao sair", variant: "destructive" });
    } else {
      toast({ title: "Você saiu do ministério" });
      setMyMemberships((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ministryId);
        return newSet;
      });
    }

    setActionLoading(null);
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
        <h1 className="text-3xl font-display font-bold text-foreground">Ministérios</h1>
        <p className="text-muted-foreground mt-1">
          Participe dos ministérios da igreja e conecte-se com outros membros
        </p>
      </div>

      {/* My Ministries */}
      {myMemberships.size > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-primary" />
            Meus Ministérios ({myMemberships.size})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ministries
              .filter((m) => myMemberships.has(m.id))
              .map((ministry) => (
                <Card key={ministry.id} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${ministry.color}`} />
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${ministry.color} flex items-center justify-center text-white font-bold text-xl shrink-0`}>
                        {ministry.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{ministry.name}</h3>
                          <Badge variant="secondary" className="shrink-0">
                            <Check className="w-3 h-3 mr-1" />
                            Membro
                          </Badge>
                        </div>
                        {ministry.leader_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Líder: {ministry.leader_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => navigate(`/membro/grupos/${ministry.id}`)}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Abrir Grupo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLeave(ministry.id)}
                        disabled={actionLoading === ministry.id}
                      >
                        Sair
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Available Ministries */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          {myMemberships.size > 0 ? "Outros Ministérios" : "Todos os Ministérios"}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ministries
            .filter((m) => !myMemberships.has(m.id))
            .map((ministry) => (
              <Card key={ministry.id} className="relative overflow-hidden">
                {ministry.image_url && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={ministry.image_url}
                      alt={ministry.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className={ministry.image_url ? "pt-4" : "pt-6"}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${ministry.color} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                      {ministry.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{ministry.name}</h3>
                      {ministry.leader_name && (
                        <p className="text-sm text-muted-foreground">
                          Líder: {ministry.leader_name}
                        </p>
                      )}
                    </div>
                  </div>
                  {ministry.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {ministry.description}
                    </p>
                  )}
                  <Button
                    className="w-full mt-4 gap-2"
                    onClick={() => handleJoin(ministry.id)}
                    disabled={actionLoading === ministry.id}
                  >
                    <UserPlus className="w-4 h-4" />
                    {actionLoading === ministry.id ? "Entrando..." : "Participar"}
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>

        {ministries.filter((m) => !myMemberships.has(m.id)).length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Você já participa de todos os ministérios disponíveis!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberMinistries;
