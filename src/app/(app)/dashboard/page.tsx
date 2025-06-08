
"use client";

import { useState, useEffect, useMemo } from "react";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { DollarSign, Users, BarChartBig, AlertTriangle, Sparkles } from "lucide-react";
import { useDebtors } from "@/contexts/debtors-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDebtSummary, type DebtSummaryInput, type DebtSummaryOutput } from "@/ai/flows/debt-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { debtors, loadingDebtors } = useDebtors();
  const [aiSummary, setAiSummary] = useState<DebtSummaryOutput | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);

  const pageTitle = "لوحة التحكم"; 
  const totalDebtTitle = "إجمالي الديون";
  const totalDebtDesc = (utilization: string) => `تم استخدام ${utilization}% من الحدود الائتمانية`;
  const totalDebtorsTitle = "إجمالي المدينين";
  const totalDebtorsDesc = "المدينون النشطون قيد التتبع";
  const avgDebtTitle = "متوسط الدين لكل مدين";
  const avgDebtDesc = "متوسط المبلغ المستحق";
  const debtorsOverLimitTitle = "المدينون المتجاوزون للحد";
  const debtorsOverLimitDesc = "تجاوزوا الحدود الائتمانية";
  const aiOverviewTitle = "نظرة عامة على الديون بالذكاء الاصطناعي";
  const aiOverviewDesc = "رؤى وتوصيات بناءً على محفظة ديونك الحالية.";
  const refreshButtonText = "تحديث الملخص";
  const refreshingButtonText = "جاري التحديث...";
  const aiSummaryTitle = "الملخص";
  const aiRiskTitle = "تقييم المخاطر";
  const aiRecsTitle = "التوصيات";
  const aiNoDataSummary = "لا توجد بيانات مدينين متاحة لإنشاء ملخص.";
  const aiNoDataRisk = "غير متاح";
  const aiNoDataRecs = "أضف معلومات المدينين للحصول على ملخص وتوصيات مدعومة بالذكاء الاصطناعي.";
  const aiErrorSummary = "خطأ في إنشاء ملخص الذكاء الاصطناعي.";
  const aiErrorRisk = "تعذر تقييم المخاطر.";
  const aiErrorRecs = "يرجى المحاولة مرة أخرى لاحقًا.";

  const stats = useMemo(() => {
    const totalDebt = debtors.reduce((sum, d) => sum + d.amountOwed, 0);
    const numberOfDebtors = debtors.length;
    const averageDebtPerDebtor = numberOfDebtors > 0 ? totalDebt / numberOfDebtors : 0;
    const debtorsOverLimit = debtors.filter(d => d.amountOwed > d.creditLimit).length;
    const totalCreditLimit = debtors.reduce((sum, d) => sum + d.creditLimit, 0);
    const creditLimitUtilization = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0;

    return {
      totalDebt,
      numberOfDebtors,
      averageDebtPerDebtor,
      debtorsOverLimit,
      creditLimitUtilization,
      largestDebt: Math.max(0, ...debtors.map(d => d.amountOwed)),
    };
  }, [debtors]);

  const fetchAiSummary = async () => {
    if (stats.numberOfDebtors === 0) {
      setAiSummary({
        summary: aiNoDataSummary,
        riskAssessment: aiNoDataRisk,
        recommendations: aiNoDataRecs
      });
      return;
    }

    setLoadingAiSummary(true);
    try {
      const input: DebtSummaryInput = {
        totalDebt: stats.totalDebt,
        numberOfDebtors: stats.numberOfDebtors,
        averageDebtPerDebtor: stats.averageDebtPerDebtor,
        largestDebt: stats.largestDebt,
        creditLimitUtilization: parseFloat(stats.creditLimitUtilization.toFixed(2)),
      };
      const summary = await getDebtSummary(input);
      setAiSummary(summary);
    } catch (error) {
      console.error("خطأ في جلب ملخص الذكاء الاصطناعي:", error);
      setAiSummary({
        summary: aiErrorSummary,
        riskAssessment: aiErrorRisk,
        recommendations: aiErrorRecs
      });
    } finally {
      setLoadingAiSummary(false);
    }
  };

  useEffect(() => {
    if (!loadingDebtors) {
      fetchAiSummary();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingDebtors, debtors]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-semibold text-foreground">{pageTitle}</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title={totalDebtTitle}
          value={`$${stats.totalDebt.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          isLoading={loadingDebtors}
          description={totalDebtDesc(stats.creditLimitUtilization.toFixed(1))}
        />
        <SummaryCard
          title={totalDebtorsTitle}
          value={stats.numberOfDebtors.toLocaleString('ar-EG')}
          icon={Users}
          isLoading={loadingDebtors}
          description={totalDebtorsDesc}
        />
        <SummaryCard
          title={avgDebtTitle}
          value={`$${stats.averageDebtPerDebtor.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={BarChartBig}
          isLoading={loadingDebtors}
          description={avgDebtDesc}
        />
        <SummaryCard
          title={debtorsOverLimitTitle}
          value={stats.debtorsOverLimit.toLocaleString('ar-EG')}
          icon={AlertTriangle}
          isLoading={loadingDebtors}
          description={debtorsOverLimitDesc}
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-headline flex items-center">
              <Sparkles className="h-6 w-6 ml-2 rtl:mr-2 rtl:ml-0 text-primary" />
              {aiOverviewTitle}
            </CardTitle>
            <CardDescription>{aiOverviewDesc}</CardDescription>
          </div>
          <Button onClick={fetchAiSummary} disabled={loadingAiSummary || loadingDebtors} size="sm">
            {loadingAiSummary ? refreshingButtonText : refreshButtonText}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingAiSummary || loadingDebtors ? (
            <>
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/3 mt-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </>
          ) : aiSummary ? (
            <>
              <div>
                <h3 className="font-semibold text-foreground">{aiSummaryTitle}</h3>
                <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{aiRiskTitle}</h3>
                <p className="text-sm text-muted-foreground">{aiSummary.riskAssessment}</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{aiRecsTitle}</h3>
                <p className="text-sm text-muted-foreground">{aiSummary.recommendations}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">انقر فوق "{refreshButtonText}" لإنشاء رؤى.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
