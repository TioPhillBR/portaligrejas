import { useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExportData {
  currentMRR: number;
  mrrGrowth: string | number;
  totalChurches: number;
  activeChurches: number;
  paidChurches: number;
  conversionRate: string | number;
  monthlyChurnRate: string | number;
  arpu: number;
  planDistribution: Array<{ name: string; value: number }>;
  mrrByMonth: Array<{ month: string; mrr: number; churches: number }>;
}

export const useReportExport = () => {
  const exportToPDF = useCallback((data: ExportData) => {
    const doc = new jsPDF();
    const today = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246);
    doc.text("Portal Igrejas - Relatório Financeiro", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Gerado em: ${today}`, 14, 30);

    // KPIs Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Indicadores Principais (KPIs)", 14, 45);

    autoTable(doc, {
      startY: 50,
      head: [["Métrica", "Valor"]],
      body: [
        ["MRR Total", `R$ ${data.currentMRR.toFixed(2).replace(".", ",")}`],
        ["Crescimento MRR", `${data.mrrGrowth}%`],
        ["Taxa de Conversão", `${data.conversionRate}%`],
        ["Churn Rate", `${data.monthlyChurnRate}%`],
        ["ARPU", `R$ ${data.arpu.toFixed(2).replace(".", ",")}`],
        ["Total de Igrejas", data.totalChurches.toString()],
        ["Igrejas Ativas", data.activeChurches.toString()],
        ["Igrejas Pagas", data.paidChurches.toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // Plan Distribution
    const finalY1 = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.text("Distribuição por Plano", 14, finalY1 + 15);

    autoTable(doc, {
      startY: finalY1 + 20,
      head: [["Plano", "Quantidade"]],
      body: data.planDistribution.map((p) => [p.name, p.value.toString()]),
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
    });

    // MRR Evolution
    const finalY2 = (doc as any).lastAutoTable.finalY || 180;
    
    if (finalY2 > 240) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Evolução do MRR", 14, 20);
      autoTable(doc, {
        startY: 25,
        head: [["Mês", "MRR (R$)", "Igrejas"]],
        body: data.mrrByMonth.map((m) => [
          m.month,
          m.mrr.toFixed(2).replace(".", ","),
          m.churches.toString(),
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });
    } else {
      doc.setFontSize(14);
      doc.text("Evolução do MRR", 14, finalY2 + 15);
      autoTable(doc, {
        startY: finalY2 + 20,
        head: [["Mês", "MRR (R$)", "Igrejas"]],
        body: data.mrrByMonth.map((m) => [
          m.month,
          m.mrr.toFixed(2).replace(".", ","),
          m.churches.toString(),
        ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Página ${i} de ${pageCount} - Portal Igrejas`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    doc.save(`relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }, []);

  const exportToExcel = useCallback((data: ExportData) => {
    const wb = XLSX.utils.book_new();

    // KPIs Sheet
    const kpisData = [
      ["Métrica", "Valor"],
      ["MRR Total", data.currentMRR],
      ["Crescimento MRR (%)", Number(data.mrrGrowth)],
      ["Taxa de Conversão (%)", Number(data.conversionRate)],
      ["Churn Rate (%)", Number(data.monthlyChurnRate)],
      ["ARPU", data.arpu],
      ["Total de Igrejas", data.totalChurches],
      ["Igrejas Ativas", data.activeChurches],
      ["Igrejas Pagas", data.paidChurches],
    ];
    const wsKpis = XLSX.utils.aoa_to_sheet(kpisData);
    wsKpis["!cols"] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsKpis, "KPIs");

    // Plan Distribution Sheet
    const planData = [
      ["Plano", "Quantidade"],
      ...data.planDistribution.map((p) => [p.name, p.value]),
    ];
    const wsPlan = XLSX.utils.aoa_to_sheet(planData);
    wsPlan["!cols"] = [{ wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsPlan, "Distribuição Planos");

    // MRR Evolution Sheet
    const mrrData = [
      ["Mês", "MRR (R$)", "Igrejas"],
      ...data.mrrByMonth.map((m) => [m.month, m.mrr, m.churches]),
    ];
    const wsMrr = XLSX.utils.aoa_to_sheet(mrrData);
    wsMrr["!cols"] = [{ wch: 12 }, { wch: 15 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, wsMrr, "Evolução MRR");

    XLSX.writeFile(wb, `relatorio-financeiro-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  }, []);

  return { exportToPDF, exportToExcel };
};
