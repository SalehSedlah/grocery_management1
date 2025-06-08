
"use client";

import { useState, useEffect } from "react";
import { useDebtors } from "@/contexts/debtors-context";
import type { Debtor } from "@/types/debt";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtorStatementView } from "@/components/debt-management/debtor-statement-view";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatementsPage() {
  const { debtors, loadingDebtors, getDebtorById } = useDebtors();
  const [selectedDebtorId, setSelectedDebtorId] = useState<string | null>(null);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  const pageTitle = "كشوفات الحسابات";
  const pageDescription = "عرض وتحليل كشوفات الحسابات المختلفة المتعلقة بنشاطك التجاري.";
  
  const debtorStatementTitle = "كشف حساب المدين";
  const debtorStatementDescription = "اختر مدينًا لعرض كشف حسابه التفصيلي بما في ذلك جميع المعاملات والرصيد الحالي.";
  const selectDebtorLabel = "اختر المدين:";
  const selectDebtorPlaceholder = "اختر مدينًا...";
  const noDebtorSelectedText = "يرجى اختيار مدين لعرض كشف حسابه.";
  const noDebtorsAvailableText = "لا يوجد مدينون مضافون حاليًا. يرجى إضافة مدينين أولاً.";

  const inventoryStatementTitle = "كشف المخزون الحالي";
  const inventoryStatementDescription = "للحصول على نظرة تفصيلية على مخزونك الحالي، بما في ذلك الكميات، القيم، وحالة المنتجات، يرجى زيارة صفحة إدارة المنتجات.";
  const goToProductsButton = "الانتقال إلى إدارة المنتجات";

  const salesPurchasesStatementTitle = "كشوفات المبيعات والمشتريات التاريخية";
  const salesPurchasesStatementDescription = "ملاحظة: تتطلب كشوفات المبيعات والمشتريات التاريخية المفصلة (مثل تقارير المبيعات اليومية أو الشهرية) نظامًا لتسجيل كل معاملة بيع وشراء فردية. هذه الميزة هي قيد التطوير المستقبلي لتقديم تحليلات أعمق. حاليًا، يمكنك استخدام المساعد الذكي في صفحة المنتجات لتحليل البيانات الحالية أو ملخصات تقدمها له.";
  const unableToGeneratePdf = "ملاحظة: إمكانية تصدير الكشوفات كملفات PDF هي ميزة متقدمة سيتم العمل عليها مستقبلاً.";


  useEffect(() => {
    if (selectedDebtorId) {
      const debtor = getDebtorById(selectedDebtorId);
      setSelectedDebtor(debtor || null);
    } else {
      setSelectedDebtor(null);
    }
  }, [selectedDebtorId, getDebtorById, debtors]); // Added debtors to dependency array

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{debtorStatementTitle}</CardTitle>
          <CardDescription>{debtorStatementDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingDebtors ? (
            <Skeleton className="h-10 w-full" />
          ) : debtors.length === 0 ? (
            <p className="text-muted-foreground">{noDebtorsAvailableText}</p>
          ) : (
            <div>
              <Label htmlFor="debtor-select">{selectDebtorLabel}</Label>
              <Select onValueChange={setSelectedDebtorId} value={selectedDebtorId || ""}>
                <SelectTrigger id="debtor-select" className="w-full md:w-[300px] mt-1">
                  <SelectValue placeholder={selectDebtorPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {debtors.map((debtor) => (
                    <SelectItem key={debtor.id} value={debtor.id}>
                      {debtor.name} ({debtor.amountOwed.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDebtor ? (
            <DebtorStatementView debtor={selectedDebtor} />
          ) : (
            !loadingDebtors && debtors.length > 0 && <p className="text-muted-foreground pt-4">{noDebtorSelectedText}</p>
          )}
           <p className="text-xs text-muted-foreground pt-4">{unableToGeneratePdf}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{inventoryStatementTitle}</CardTitle>
          <CardDescription>{inventoryStatementDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/products">{goToProductsButton}</Link>
          </Button>
          <p className="text-xs text-muted-foreground pt-4 mt-2">{unableToGeneratePdf}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>{salesPurchasesStatementTitle}</CardTitle>
          <CardDescription>{salesPurchasesStatementDescription}</CardDescription>
        </CardHeader>
         <CardContent>
           <p className="text-xs text-muted-foreground">{unableToGeneratePdf}</p>
        </CardContent>
      </Card>
    </div>
  );
}
