import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Church, MapPin, ExternalLink, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

interface ChurchData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string | null;
  logo_url: string | null;
}

const ChurchesList = () => {
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    try {
      const { data, error } = await supabase
        .from("churches")
        .select("id, name, slug, description, address, logo_url")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error("Error fetching churches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChurches = churches.filter((church) =>
    church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    church.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Church className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Portal Igrejas</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Encontre uma Igreja
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore as igrejas cadastradas no Portal Igrejas e encontre uma comunidade perto de você.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou localização..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Churches Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                      <div className="flex-1">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-full mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredChurches.length === 0 ? (
            <div className="text-center py-12">
              <Church className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhuma igreja encontrada
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Ainda não há igrejas cadastradas"}
              </p>
              <Button asChild>
                <Link to="/criar-igreja">Cadastrar minha igreja</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <Badge variant="secondary" className="text-sm">
                  {filteredChurches.length} igreja{filteredChurches.length !== 1 ? "s" : ""} encontrada{filteredChurches.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChurches.map((church, index) => (
                  <motion.div
                    key={church.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          {church.logo_url ? (
                            <img
                              src={church.logo_url}
                              alt={church.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Church className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {church.name}
                            </h3>
                            {church.address && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{church.address}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {church.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {church.description}
                          </p>
                        )}

                        <Button
                          asChild
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        >
                          <Link to={`/${church.slug}`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visitar site
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Sua igreja ainda não está aqui?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Crie o site da sua igreja em minutos e faça parte do Portal Igrejas.
          </p>
          <Button asChild size="lg">
            <Link to="/criar-igreja">Criar site da minha igreja</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ChurchesList;
