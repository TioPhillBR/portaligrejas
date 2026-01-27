import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Ticket, Plus, Gift, Trash2, Loader2, Copy, Check, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

interface GrantedAccount {
  id: string;
  email: string;
  plan: string;
  notes: string | null;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

const PLAN_LABELS: Record<string, string> = {
  prata: "Prata (R$ 69/mês)",
  ouro: "Ouro (R$ 119/mês)",
  diamante: "Diamante (R$ 189/mês)",
};

const PlatformCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [grantedAccounts, setGrantedAccounts] = useState<GrantedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Coupon form state
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    valid_until: "",
  });

  // Granted account form state
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountForm, setAccountForm] = useState({
    email: "",
    plan: "prata",
    notes: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [couponsRes, accountsRes] = await Promise.all([
        supabase.from("discount_coupons").select("*").order("created_at", { ascending: false }),
        supabase.from("granted_free_accounts").select("*").order("created_at", { ascending: false }),
      ]);

      if (couponsRes.error) throw couponsRes.error;
      if (accountsRes.error) throw accountsRes.error;

      setCoupons(couponsRes.data || []);
      setGrantedAccounts(accountsRes.data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const generateCouponCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm({ ...couponForm, code });
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code || !couponForm.discount_value) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("discount_coupons").insert({
        code: couponForm.code.toUpperCase(),
        description: couponForm.description || null,
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
        valid_until: couponForm.valid_until || null,
      });

      if (error) throw error;

      toast.success("Cupom criado com sucesso!");
      setCouponDialogOpen(false);
      setCouponForm({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        max_uses: "",
        valid_until: "",
      });
      fetchData();
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast.error(error.message || "Erro ao criar cupom");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCoupon = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("discount_coupons")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(isActive ? "Cupom ativado" : "Cupom desativado");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao atualizar cupom");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;

    try {
      const { error } = await supabase.from("discount_coupons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Cupom excluído");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir cupom");
    }
  };

  const handleCreateGrantedAccount = async () => {
    if (!accountForm.email) {
      toast.error("Preencha o email");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("granted_free_accounts").insert({
        email: accountForm.email.toLowerCase(),
        plan: accountForm.plan,
        notes: accountForm.notes || null,
        expires_at: accountForm.expires_at || null,
      });

      if (error) throw error;

      toast.success("Conta gratuita cadastrada!");
      setAccountDialogOpen(false);
      setAccountForm({ email: "", plan: "prata", notes: "", expires_at: "" });
      fetchData();
    } catch (error: any) {
      console.error("Error creating granted account:", error);
      toast.error(error.message || "Erro ao cadastrar conta");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGrantedAccount = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta conta?")) return;

    try {
      const { error } = await supabase.from("granted_free_accounts").delete().eq("id", id);
      if (error) throw error;
      toast.success("Conta excluída");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao excluir conta");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Cupons e Contas Gratuitas</h1>
        <p className="text-muted-foreground">
          Gerencie cupons de desconto e conceda acesso gratuito a igrejas
        </p>
      </div>

      <Tabs defaultValue="coupons" className="space-y-4">
        <TabsList>
          <TabsTrigger value="coupons" className="gap-2">
            <Ticket className="w-4 h-4" />
            Cupons de Desconto
          </TabsTrigger>
          <TabsTrigger value="free-accounts" className="gap-2">
            <Gift className="w-4 h-4" />
            Contas Gratuitas
          </TabsTrigger>
        </TabsList>

        {/* Coupons Tab */}
        <TabsContent value="coupons">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Cupons de Desconto</CardTitle>
                <CardDescription>
                  Crie cupons para oferecer descontos nas assinaturas
                </CardDescription>
              </div>
              <Dialog open={couponDialogOpen} onOpenChange={setCouponDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Novo Cupom
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Cupom de Desconto</DialogTitle>
                    <DialogDescription>
                      Configure os detalhes do cupom de desconto
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Código do Cupom *</Label>
                        <Input
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                          placeholder="DESCONTO20"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button variant="outline" onClick={generateCouponCode}>
                          Gerar
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                        placeholder="Cupom de lançamento"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo de Desconto</Label>
                        <Select
                          value={couponForm.discount_type}
                          onValueChange={(v) => setCouponForm({ ...couponForm, discount_type: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Valor do Desconto *</Label>
                        <Input
                          type="number"
                          value={couponForm.discount_value}
                          onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
                          placeholder={couponForm.discount_type === "percentage" ? "20" : "50"}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Máximo de Usos</Label>
                        <Input
                          type="number"
                          value={couponForm.max_uses}
                          onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })}
                          placeholder="Ilimitado"
                        />
                      </div>
                      <div>
                        <Label>Válido Até</Label>
                        <Input
                          type="date"
                          value={couponForm.valid_until}
                          onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCouponDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateCoupon} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Criar Cupom
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Desconto</TableHead>
                    <TableHead>Usos</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum cupom cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded font-mono">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(coupon.code)}
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          {coupon.description && (
                            <p className="text-sm text-muted-foreground">{coupon.description}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {coupon.discount_type === "percentage"
                              ? `${coupon.discount_value}%`
                              : `R$ ${coupon.discount_value.toFixed(2)}`}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.current_uses}/{coupon.max_uses || "∞"}
                        </TableCell>
                        <TableCell>
                          {coupon.valid_until
                            ? format(new Date(coupon.valid_until), "dd/MM/yyyy", { locale: ptBR })
                            : "Sem limite"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={(checked) => handleToggleCoupon(coupon.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Free Accounts Tab */}
        <TabsContent value="free-accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contas Gratuitas</CardTitle>
                <CardDescription>
                  Cadastre emails para acesso gratuito a planos pagos (sem necessidade de pagamento)
                </CardDescription>
              </div>
              <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Adicionar Conta
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cadastrar Conta Gratuita</DialogTitle>
                    <DialogDescription>
                      O usuário com este email terá acesso gratuito ao plano selecionado ao criar sua igreja
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                        placeholder="usuario@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label>Plano</Label>
                      <Select
                        value={accountForm.plan}
                        onValueChange={(v) => setAccountForm({ ...accountForm, plan: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prata">{PLAN_LABELS.prata}</SelectItem>
                          <SelectItem value="ouro">{PLAN_LABELS.ouro}</SelectItem>
                          <SelectItem value="diamante">{PLAN_LABELS.diamante}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        value={accountForm.notes}
                        onChange={(e) => setAccountForm({ ...accountForm, notes: e.target.value })}
                        placeholder="Motivo da concessão, parceria, etc."
                      />
                    </div>
                    <div>
                      <Label>Data de Expiração (opcional)</Label>
                      <Input
                        type="date"
                        value={accountForm.expires_at}
                        onChange={(e) => setAccountForm({ ...accountForm, expires_at: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Deixe vazio para acesso permanente
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAccountDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateGrantedAccount} disabled={saving}>
                      {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Cadastrar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Cadastrado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grantedAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhuma conta cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    grantedAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{account.email}</p>
                            {account.notes && (
                              <p className="text-sm text-muted-foreground">{account.notes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              account.plan === "diamante"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                                : account.plan === "ouro"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : ""
                            }
                          >
                            {account.plan.charAt(0).toUpperCase() + account.plan.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {account.is_used ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Utilizado
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {account.expires_at
                            ? format(new Date(account.expires_at), "dd/MM/yyyy", { locale: ptBR })
                            : "Permanente"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(account.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteGrantedAccount(account.id)}
                            disabled={account.is_used}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformCoupons;
