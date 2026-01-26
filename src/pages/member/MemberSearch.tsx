import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MessageCircle, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

interface MemberProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  ministries: string[];
}

const MemberSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchInitialMembers();
  }, [user]);

  useEffect(() => {
    if (debouncedSearch) {
      searchMembers(debouncedSearch);
    } else {
      fetchInitialMembers();
    }
  }, [debouncedSearch]);

  const fetchInitialMembers = async () => {
    if (!user) return;
    setLoading(true);

    // Fetch public members (excluding self)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, bio")
      .eq("is_public_member", true)
      .neq("user_id", user.id)
      .order("full_name")
      .limit(20);

    if (profiles) {
      await fetchMinistriesForMembers(profiles);
    } else {
      setMembers([]);
    }

    setLoading(false);
    setInitialLoading(false);
  };

  const searchMembers = async (query: string) => {
    if (!user) return;
    setLoading(true);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, bio")
      .eq("is_public_member", true)
      .neq("user_id", user.id)
      .ilike("full_name", `%${query}%`)
      .order("full_name")
      .limit(20);

    if (profiles) {
      await fetchMinistriesForMembers(profiles);
    } else {
      setMembers([]);
    }

    setLoading(false);
  };

  const fetchMinistriesForMembers = async (profiles: any[]) => {
    const userIds = profiles.map(p => p.user_id);

    // Fetch ministry memberships
    const { data: memberships } = await supabase
      .from("ministry_members")
      .select(`
        user_id,
        ministries (name)
      `)
      .in("user_id", userIds)
      .eq("is_active", true);

    // Group ministries by user
    const ministryMap = new Map<string, string[]>();
    memberships?.forEach((m: any) => {
      if (m.ministries?.name) {
        const existing = ministryMap.get(m.user_id) || [];
        existing.push(m.ministries.name);
        ministryMap.set(m.user_id, existing);
      }
    });

    const membersWithMinistries = profiles.map(p => ({
      ...p,
      ministries: ministryMap.get(p.user_id) || [],
    }));

    setMembers(membersWithMinistries);
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">Buscar Membros</h1>
        <p className="text-muted-foreground mt-1">
          Encontre outros membros da igreja e inicie uma conversa
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>
            {searchQuery
              ? "Nenhum membro encontrado com esse nome"
              : "Nenhum membro público encontrado"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {members.map((member) => (
            <Card key={member.user_id} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-lg">
                      {member.full_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {member.full_name || "Membro"}
                    </h3>
                    
                    {member.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {member.bio}
                      </p>
                    )}
                    
                    {member.ministries.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.ministries.slice(0, 3).map((ministry, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {ministry}
                          </Badge>
                        ))}
                        {member.ministries.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{member.ministries.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <Link to={`/membro/mensagens/${member.user_id}`}>
                    <Button size="icon" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberSearch;
