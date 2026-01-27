import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Trash2, UserPlus, Shield, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserWithRoles {
  userId: string;
  email: string;
  fullName: string | null;
  roles: { id: string; role: AppRole; ministryId: string | null }[];
}

const roleLabels: Record<AppRole, string> = {
  platform_admin: "Admin da Plataforma",
  super_admin: "Super Admin",
  church_owner: "Dono da Igreja",
  church_admin: "Admin da Igreja",
  lider_ministerio: "Líder de Ministério",
  secretaria: "Secretaria",
  midia: "Mídia",
  comunicacao: "Comunicação",
  usuario: "Usuário",
};

const roleColors: Record<AppRole, string> = {
  platform_admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  super_admin: "bg-red-500/10 text-red-500 border-red-500/20",
  church_owner: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  church_admin: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  lider_ministerio: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  secretaria: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  midia: "bg-green-500/10 text-green-500 border-green-500/20",
  comunicacao: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  usuario: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const AdminUsers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Form states
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("secretaria");
  const [newRole, setNewRole] = useState<AppRole>("secretaria");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAdminStatus();
    fetchUsers();
  }, []);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase.rpc("is_admin", {
      _user_id: user.id,
    });

    if (!error && data) {
      setIsSuperAdmin(true);
    }
  };

  const fetchUsers = async () => {
    try {
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, ministry_id");

      if (rolesError) throw rolesError;

      // Fetch profiles for these users
      const userIds = [...new Set(rolesData?.map((r) => r.user_id) || [])];

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Group roles by user
      const usersMap = new Map<string, UserWithRoles>();

      rolesData?.forEach((roleRecord) => {
        const profile = profilesData?.find(
          (p) => p.user_id === roleRecord.user_id
        );

        if (!usersMap.has(roleRecord.user_id)) {
          usersMap.set(roleRecord.user_id, {
            userId: roleRecord.user_id,
            email: "", // We'll fetch this from auth if needed
            fullName: profile?.full_name || null,
            roles: [],
          });
        }

        usersMap.get(roleRecord.user_id)?.roles.push({
          id: roleRecord.id,
          role: roleRecord.role,
          ministryId: roleRecord.ministry_id,
        });
      });

      setUsers(Array.from(usersMap.values()));
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas Super Admins podem criar usuários",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the edge function to create user
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: newUserEmail,
            password: newUserPassword,
            fullName: newUserName,
            role: newUserRole,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar usuário");
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso",
      });

      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("secretaria");
      setIsAddDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar usuário",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !isSuperAdmin) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: selectedUserId,
        role: newRole,
      });

      if (error) {
        if (error.code === "23505") {
          throw new Error("Este usuário já possui esta função");
        }
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Função adicionada com sucesso",
      });

      setIsAddRoleDialogOpen(false);
      setSelectedUserId(null);
      setNewRole("secretaria");
      fetchUsers();
    } catch (error: any) {
      console.error("Error adding role:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar função",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId: string, userId: string) => {
    if (!isSuperAdmin) return;

    // Prevent deleting own super_admin role
    if (userId === user?.id) {
      const roleToDelete = users
        .find((u) => u.userId === userId)
        ?.roles.find((r) => r.id === roleId);

      if (roleToDelete?.role === "super_admin") {
        toast({
          title: "Ação não permitida",
          description: "Você não pode remover sua própria função de Super Admin",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Função removida com sucesso",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Erro",
        description: "Erro ao remover função",
        variant: "destructive",
      });
    }
  };

  if (!isSuperAdmin && !loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os administradores e suas permissões
          </p>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Apenas Super Admins podem gerenciar usuários e permissões.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os administradores e suas permissões
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Administrador</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova conta de administrador
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nome do administrador"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função Principal</Label>
                <Select
                  value={newUserRole}
                  onValueChange={(value) => setNewUserRole(value as AppRole)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Criar Usuário
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funções Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="flex items-center gap-2">
                <Badge className={roleColors[role as AppRole]}>{label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {role === "super_admin" && "- Acesso total ao sistema"}
                  {role === "lider_ministerio" && "- Gerencia ministérios"}
                  {role === "secretaria" && "- Gerencia eventos e agenda"}
                  {role === "midia" && "- Gerencia galeria e vídeos"}
                  {role === "comunicacao" && "- Gerencia rádio e comunicação"}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Administradores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Nenhum administrador cadastrado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Funções</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => (
                    <TableRow key={userItem.userId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {userItem.fullName || "Sem nome"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ID: {userItem.userId.slice(0, 8)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {userItem.roles.map((roleItem) => (
                            <div
                              key={roleItem.id}
                              className="flex items-center gap-1"
                            >
                              <Badge className={roleColors[roleItem.role]}>
                                {roleLabels[roleItem.role]}
                              </Badge>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remover função?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover a função{" "}
                                      <strong>{roleLabels[roleItem.role]}</strong>{" "}
                                      deste usuário?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteRole(
                                          roleItem.id,
                                          userItem.userId
                                        )
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => {
                            setSelectedUserId(userItem.userId);
                            setIsAddRoleDialogOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3" />
                          Função
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Função</DialogTitle>
            <DialogDescription>
              Selecione uma nova função para adicionar ao usuário
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRole} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">Função</Label>
              <Select
                value={newRole}
                onValueChange={(value) => setNewRole(value as AppRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(roleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAddRoleDialogOpen(false);
                  setSelectedUserId(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Adicionar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
