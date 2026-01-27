import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfMonth, subMonths, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ChurchData {
  id: string;
  name: string;
  plan: string;
  status: string;
  created_at: string;
}

interface SubscriptionHistory {
  id: string;
  church_id: string;
  old_plan: string | null;
  new_plan: string;
  change_type: string;
  created_at: string;
}

interface CohortAnalysisProps {
  churches: ChurchData[];
  history: SubscriptionHistory[];
}

interface CohortData {
  cohortMonth: string;
  cohortDate: Date;
  totalSignups: number;
  retentionByMonth: { month: number; retained: number; rate: number }[];
}

export const CohortAnalysis = ({ churches, history }: CohortAnalysisProps) => {
  const cohortData = useMemo(() => {
    // Get last 6 months for cohort analysis
    const endDate = startOfMonth(new Date());
    const startDate = startOfMonth(subMonths(endDate, 5));
    const months = eachMonthOfInterval({ start: startDate, end: endDate });

    const cohorts: CohortData[] = months.map((cohortDate) => {
      const cohortMonthStr = format(cohortDate, "yyyy-MM");
      
      // Get churches that signed up in this cohort month
      const cohortChurches = churches.filter((c) => {
        const signupMonth = format(new Date(c.created_at), "yyyy-MM");
        return signupMonth === cohortMonthStr;
      });

      const totalSignups = cohortChurches.length;

      // Calculate retention for each month after signup
      const retentionByMonth: { month: number; retained: number; rate: number }[] = [];
      
      for (let monthOffset = 0; monthOffset <= 5; monthOffset++) {
        const checkDate = startOfMonth(subMonths(new Date(), 5 - months.indexOf(cohortDate) - monthOffset));
        
        if (checkDate > new Date()) break;

        // Count how many from this cohort are still active/paid
        const activeCount = cohortChurches.filter((c) => {
          // Check if church was cancelled before this check date
          const churchCancellations = history.filter(
            (h) => h.church_id === c.id && h.change_type === "cancelled"
          );
          
          const wasCancelledBefore = churchCancellations.some(
            (h) => new Date(h.created_at) <= checkDate
          );
          
          // Check if still active and on paid plan
          const isActive = c.status === "active" && c.plan && c.plan !== "free";
          
          return isActive && !wasCancelledBefore;
        }).length;

        retentionByMonth.push({
          month: monthOffset,
          retained: activeCount,
          rate: totalSignups > 0 ? (activeCount / totalSignups) * 100 : 0,
        });
      }

      return {
        cohortMonth: format(cohortDate, "MMM yyyy", { locale: ptBR }),
        cohortDate,
        totalSignups,
        retentionByMonth,
      };
    });

    return cohorts;
  }, [churches, history]);

  const getRetentionColor = (rate: number): string => {
    if (rate >= 80) return "bg-green-500";
    if (rate >= 60) return "bg-green-400";
    if (rate >= 40) return "bg-yellow-400";
    if (rate >= 20) return "bg-orange-400";
    return "bg-red-400";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Cohort</CardTitle>
        <CardDescription>
          Retenção de clientes por mês de aquisição - mostra como cada grupo de clientes evolui ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Cohort</th>
                <th className="text-center py-3 px-2">Total</th>
                <th className="text-center py-3 px-2">Mês 0</th>
                <th className="text-center py-3 px-2">Mês 1</th>
                <th className="text-center py-3 px-2">Mês 2</th>
                <th className="text-center py-3 px-2">Mês 3</th>
                <th className="text-center py-3 px-2">Mês 4</th>
                <th className="text-center py-3 px-2">Mês 5</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort) => (
                <tr key={cohort.cohortMonth} className="border-b">
                  <td className="py-3 px-2 font-medium capitalize">{cohort.cohortMonth}</td>
                  <td className="py-3 px-2 text-center font-semibold">{cohort.totalSignups}</td>
                  {[0, 1, 2, 3, 4, 5].map((monthOffset) => {
                    const retention = cohort.retentionByMonth.find((r) => r.month === monthOffset);
                    if (!retention) {
                      return <td key={monthOffset} className="py-3 px-2 text-center text-muted-foreground">-</td>;
                    }
                    return (
                      <td key={monthOffset} className="py-3 px-2 text-center">
                        <div
                          className={`inline-flex items-center justify-center min-w-[60px] px-2 py-1 rounded text-white text-xs font-medium ${getRetentionColor(retention.rate)}`}
                        >
                          {retention.rate.toFixed(0)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {cohortData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Sem dados suficientes para análise de cohort</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500" />
            <span>≥80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-400" />
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-yellow-400" />
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-orange-400" />
            <span>20-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-red-400" />
            <span>&lt;20%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortAnalysis;
