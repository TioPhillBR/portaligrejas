import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Receipt, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  FileText,
  CreditCard
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useChurch } from "@/contexts/ChurchContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PaymentRecord {
  id: string;
  amount: number;
  original_amount: number | null;
  discount_amount: number;
  coupon_code: string | null;
  status: string;
  payment_method: string | null;
  billing_type: string | null;
  due_date: string | null;
  paid_at: string | null;
  invoice_url: string | null;
  description: string | null;
  plan: string | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  paid: { label: "Pago", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
  confirmed: { label: "Confirmado", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", icon: CheckCircle },
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", icon: Clock },
  overdue: { label: "Vencido", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", icon: AlertTriangle },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", icon: XCircle },
  refunded: { label: "Reembolsado", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", icon: Receipt },
};

const PaymentHistory = () => {
  const { church } = useChurch();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    if (church?.id) {
      fetchPayments();
    }
  }, [church?.id, statusFilter, yearFilter]);

  const fetchPayments = async () => {
    try {
      let query = supabase
        .from("payment_history")
        .select("*")
        .eq("church_id", church?.id)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (yearFilter !== "all") {
        const yearStart = new Date(parseInt(yearFilter), 0, 1).toISOString();
        const yearEnd = new Date(parseInt(yearFilter), 11, 31, 23, 59, 59).toISOString();
        query = query.gte("created_at", yearStart).lte("created_at", yearEnd);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast.error("Erro ao carregar histórico de pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const methods: Record<string, string> = {
      CREDIT_CARD: "Cartão de Crédito",
      BOLETO: "Boleto",
      PIX: "PIX",
      DEBIT_CARD: "Cartão de Débito",
    };
    return methods[method || ""] || method || "-";
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  // Calculate totals
  const totals = payments.reduce(
    (acc, payment) => {
      if (payment.status === "paid" || payment.status === "confirmed") {
        acc.paid += payment.amount;
        acc.paidCount++;
      } else if (payment.status === "pending") {
        acc.pending += payment.amount;
        acc.pendingCount++;
      }
      return acc;
    },
    { paid: 0, paidCount: 0, pending: 0, pendingCount: 0 }
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Histórico de Faturas</h1>
        <p className="text-muted-foreground mt-1">Visualize todos os seus pagamentos e faturas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
            <p className="text-xs text-muted-foreground">{totals.paidCount} pagamentos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
            <p className="text-xs text-muted-foreground">{totals.pendingCount} faturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Crédito Pro-rata</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(church?.pro_rata_credit || 0)}
            </div>
            <p className="text-xs text-muted-foreground">disponível para uso</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Faturas
              </CardTitle>
              <CardDescription>{payments.length} registros encontrados</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma fatura encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const status = statusConfig[payment.status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(payment.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.description || "Assinatura mensal"}</p>
                            {payment.coupon_code && (
                              <p className="text-xs text-muted-foreground">
                                Cupom: {payment.coupon_code}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {payment.plan || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            {payment.discount_amount > 0 && (
                              <p className="text-xs text-green-600">
                                -{formatCurrency(payment.discount_amount)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <CreditCard className="h-3 w-3" />
                            {getPaymentMethodLabel(payment.payment_method)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.invoice_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(payment.invoice_url!, "_blank")}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
