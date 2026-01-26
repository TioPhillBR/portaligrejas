import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Users, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MinistryGroup {
  id: string;
  name: string;
  color: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

const MemberGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<MinistryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) return;

      // Fetch ministries the user is a member of
      const { data: membershipData } = await supabase
        .from("ministry_members")
        .select(`
          ministry_id,
          ministries (id, name, color)
        `)
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (membershipData) {
        const ministryGroups: MinistryGroup[] = [];

        for (const membership of membershipData) {
          const ministry = (membership as any).ministries;
          if (!ministry) continue;

          // Get last message for this ministry
          const { data: lastMsg } = await supabase
            .from("chat_messages")
            .select("content, created_at")
            .eq("ministry_id", ministry.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          ministryGroups.push({
            id: ministry.id,
            name: ministry.name,
            color: ministry.color,
            lastMessage: lastMsg?.content || undefined,
            lastMessageTime: lastMsg?.created_at || undefined,
          });
        }

        setGroups(ministryGroups);
      }

      setLoading(false);
    };

    fetchGroups();
  }, [user]);

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
        <h1 className="text-3xl font-display font-bold text-foreground">Grupos</h1>
        <p className="text-muted-foreground mt-1">
          Converse com os membros dos seus ministérios
        </p>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">
              Você ainda não participa de nenhum ministério
            </p>
            <Link
              to="/membro/ministerios"
              className="text-primary hover:underline font-medium"
            >
              Explorar ministérios →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {groups.map((group) => (
            <Link key={group.id} to={`/membro/grupos/${group.id}`}>
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${group.color} flex items-center justify-center text-white font-bold text-xl`}>
                      {group.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{group.name}</h3>
                      {group.lastMessage ? (
                        <p className="text-sm text-muted-foreground truncate">
                          {group.lastMessage}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Nenhuma mensagem ainda
                        </p>
                      )}
                    </div>
                    {group.lastMessageTime && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(group.lastMessageTime).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberGroups;
