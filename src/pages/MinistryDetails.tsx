import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { icons } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MinistryDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: ministry, isLoading } = useQuery({
    queryKey: ["ministry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ministries")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: memberCount } = useQuery({
    queryKey: ["ministry-member-count", id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ministry_members")
        .select("*", { count: "exact", head: true })
        .eq("ministry_id", id!)
        .eq("is_active", true);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!id,
  });

  const getIcon = (iconName: string): LucideIcon => {
    const IconComponent = icons[iconName as keyof typeof icons];
    return IconComponent || icons.Users;
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16">
          <div className="container-custom">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-[300px] w-full rounded-xl mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!ministry) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Ministério não encontrado</h1>
            <Link to="/#ministerios">
              <Button>Voltar para Ministérios</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const Icon = getIcon(ministry.icon || "Users");

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16">
        <div className="container-custom">
          {/* Back Button */}
          <Link
            to="/#ministerios"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Ministérios
          </Link>

          {/* Hero Section */}
          <div className={`relative h-[300px] rounded-xl overflow-hidden mb-8 bg-gradient-to-r ${ministry.color || "from-blue-500 to-blue-600"}`}>
            {ministry.image_url ? (
              <>
                <img
                  src={ministry.image_url}
                  alt={ministry.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="h-32 w-32 text-white/30" />
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {ministry.name}
                  </h1>
                  {ministry.leader_name && (
                    <p className="text-white/80 mt-1">
                      Líder: {ministry.leader_name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Sobre o Ministério</h2>
              
              {ministry.description ? (
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {ministry.description}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Mais informações sobre este ministério em breve.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-card rounded-xl p-6 shadow-lg border">
                <h3 className="font-semibold mb-4">Informações</h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{memberCount} Membros</p>
                      <p className="text-sm text-muted-foreground">ativos</p>
                    </div>
                  </div>

                  {ministry.leader_name && (
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{ministry.leader_name}</p>
                        <p className="text-sm text-muted-foreground">Líder</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <Link to="/cadastro" className="block">
                    <Button className="w-full">
                      Quero Participar
                    </Button>
                  </Link>
                  <Link to="/#contato" className="block">
                    <Button variant="outline" className="w-full">
                      Entrar em Contato
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge variant="outline" className="text-sm">
                  Ministério Ativo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default MinistryDetails;
