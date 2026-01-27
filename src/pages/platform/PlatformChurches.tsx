import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Search, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Church {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  plan: string | null;
  status: string | null;
  created_at: string;
}

const PlatformChurches = () => {
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchChurches();
  }, []);

  const fetchChurches = async () => {
    try {
      const { data, error } = await supabase
        .from("churches")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error("Error fetching churches:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChurches = churches.filter((church) => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = planFilter === "all" || church.plan === planFilter;
    const matchesStatus = statusFilter === "all" || church.status === statusFilter;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case "diamante":
        return <Badge className="bg-purple-500 hover:bg-purple-600">💎 Diamante</Badge>;
      case "ouro":
        return <Badge className="bg-amber-500 hover:bg-amber-600">🥇 Ouro</Badge>;
      case "prata":
        return <Badge className="bg-gray-400 hover:bg-gray-500">🥈 Prata</Badge>;
      default:
        return <Badge variant="outline">Gratuito</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspenso</Badge>;
      case "pending":
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Igrejas Cadastradas</h1>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Igrejas Cadastradas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as igrejas da plataforma
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, slug ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os planos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="ouro">Ouro</SelectItem>
                <SelectItem value="diamante">Diamante</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Igrejas ({filteredChurches.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Igreja</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChurches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma igreja encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChurches.map((church) => (
                    <TableRow key={church.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{church.name}</p>
                          {church.email && (
                            <p className="text-sm text-muted-foreground">{church.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          /{church.slug}
                        </code>
                      </TableCell>
                      <TableCell>{getPlanBadge(church.plan)}</TableCell>
                      <TableCell>{getStatusBadge(church.status)}</TableCell>
                      <TableCell>
                        {format(new Date(church.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/${church.slug}`} target="_blank">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/${church.slug}/admin`} target="_blank">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              Admin
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformChurches;
