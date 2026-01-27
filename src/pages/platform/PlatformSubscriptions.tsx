import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Search, TrendingUp, Users, Building2, Crown, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChurchWithPlan {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  created_at: string;
  settings: any;
}

const PLAN_ICONS: Record<string, any> = {
  free: Star,
  prata: Star,
  ouro: Crown,
  diamante: Zap,
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  prata: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
  ouro: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  diamante: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  prata: 49.90,
  ouro: 99.90,
  diamante: 199.90,
};

const PlatformSubscriptions = () => {
  const [churches, setChurches] = useState<ChurchWithPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    try {
      const { data, error } = await supabase
        .from("churches")
        .select("id, name, slug, plan, status, created_at, settings")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChurches(data || []);
    } catch (error: any) {
      console.error("Error fetching churches:", error);
      toast.error("Erro ao carregar igrejas");
    } finally {
      setLoading(false);
    }
  };

  const filteredChurches = churches.filter((church) => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = planFilter === "all" || church.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const paidChurches = churches.filter((c) => c.plan !== "free" && c.status === "active");
  const totalMRR = paidChurches.reduce((sum, c) => sum + (PLAN_PRICES[c.plan || "free"] || 0), 0);
  const planCounts = {
    free: churches.filter((c) => c.plan === "free").length,
    prata: churches.filter((c) => c.plan === "prata").length,
    ouro: churches.filter((c) => c.plan === "ouro").length,
    diamante: churches.filter((c) => c.plan === "diamante").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
        <p className="text-muted-foreground">
          Gerencie as assinaturas e acompanhe a receita recorrente
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">MRR Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalMRR.toFixed(2).replace(".", ",")}
            </div>
            <p className="text-xs text-muted-foreground">
              {paidChurches.length} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plano Gratuito</CardTitle>
            <Star className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planCounts.free}</div>
            <p className="text-xs text-muted-foreground">igrejas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Planos Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {planCounts.prata + planCounts.ouro + planCounts.diamante}
            </div>
            <p className="text-xs text-muted-foreground">
              {planCounts.prata} Prata, {planCounts.ouro} Ouro, {planCounts.diamante} Diamante
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {churches.length > 0
                ? ((paidChurches.length / churches.length) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">free para pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Assinaturas</CardTitle>
          <CardDescription>
            Visualize e gerencie as assinaturas de todas as igrejas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="ouro">Ouro</SelectItem>
                <SelectItem value="diamante">Diamante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Igreja</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Asaas ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredChurches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Nenhuma igreja encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChurches.map((church) => {
                    const PlanIcon = PLAN_ICONS[church.plan || "free"] || Star;
                    const subscriptionId = church.settings?.asaas_subscription_id;
                    
                    return (
                      <TableRow key={church.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{church.name}</p>
                              <p className="text-sm text-muted-foreground">/{church.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={PLAN_COLORS[church.plan || "free"]}>
                            <PlanIcon className="h-3 w-3 mr-1" />
                            {(church.plan || "free").charAt(0).toUpperCase() +
                              (church.plan || "free").slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {PLAN_PRICES[church.plan || "free"] === 0
                              ? "Grátis"
                              : `R$ ${PLAN_PRICES[church.plan || "free"]
                                  .toFixed(2)
                                  .replace(".", ",")}/mês`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={church.status === "active" ? "default" : "secondary"}
                          >
                            {church.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscriptionId ? (
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {subscriptionId}
                            </code>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSubscriptions;
