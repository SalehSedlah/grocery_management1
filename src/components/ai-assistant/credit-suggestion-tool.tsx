
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { suggestCreditLimits, type SuggestCreditLimitsInput, type SuggestCreditLimitsOutput } from "@/ai/flows/debt-suggestions";
import { useDebtors } from "@/contexts/debtors-context";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function CreditSuggestionTool() {
  const { debtors, loadingDebtors } = useDebtors();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SuggestCreditLimitsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const cardTitle = "اقتراحات الحد الائتماني";
  const cardDescription = "دع الذكاء الاصطناعي يقترح الحدود الائتمانية المثلى للمدينين بناءً على بياناتهم.";
  const generateButtonText = "إنشاء اقتراحات لجميع المدينين";
  const generatingButtonText = "جاري إنشاء الاقتراحات...";
  const loadingDebtorsButtonText = "جاري تحميل المدينين...";
  const suggestedLimitsTitle = "الحدود المقترحة:";
  const debtorNameHeader = "اسم المدين";
  const suggestedLimitHeader = "الحد المقترح";
  const reasoningHeader = "السبب";
  const noSuggestionsPlaceholder = "انقر فوق الزر أعلاه لإنشاء اقتراحات للحد الائتماني.";
  const noDebtorsPlaceholder = "يرجى إضافة مدينين في قسم إدارة الديون للحصول على اقتراحات.";

  const toastNoDebtorsTitle = "لا يوجد مدينون";
  const toastNoDebtorsDescription = "أضف مدينين للحصول على اقتراحات للحد الائتماني.";
  const toastSuggestionsReadyTitle = "الاقتراحات جاهزة";
  const toastSuggestionsReadyDescription = "قام الذكاء الاصطناعي بإنشاء اقتراحات للحد الائتماني.";
  const toastSuggestionFailedTitle = "فشل الاقتراح";

  const handleSuggestLimits = async () => {
    if (debtors.length === 0) {
      toast({ 
        title: toastNoDebtorsTitle, 
        description: toastNoDebtorsDescription, 
        variant: "default" 
      });
      return;
    }
    setIsLoading(true);
    setSuggestions(null);
    try {
      const input: SuggestCreditLimitsInput = debtors.map(d => ({
        debtorName: d.name,
        paymentHistory: d.paymentHistory,
        overallDebtAmount: d.amountOwed,
        currentCreditLimit: d.creditLimit,
      }));
      const result = await suggestCreditLimits(input);
      setSuggestions(result);
      toast({ title: toastSuggestionsReadyTitle, description: toastSuggestionsReadyDescription });
    } catch (error: any) {
      toast({ title: toastSuggestionFailedTitle, description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <Sparkles className="ml-2 rtl:mr-0 rtl:ml-2 h-5 w-5 text-primary" />
          {cardTitle}
        </CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSuggestLimits} disabled={isLoading || loadingDebtors} className="mb-6 w-full sm:w-auto">
          {isLoading ? generatingButtonText : (loadingDebtors ? loadingDebtorsButtonText : generateButtonText)}
        </Button>

        {isLoading && (
           <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        )}

        {suggestions && !isLoading && (
          <div className="mt-4 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2 text-foreground">{suggestedLimitsTitle}</h3>
            <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{debtorNameHeader}</TableHead>
                  <TableHead className="text-left rtl:text-right">{suggestedLimitHeader}</TableHead>
                  <TableHead>{reasoningHeader}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{suggestion.debtorName}</TableCell>
                    <TableCell className="text-left rtl:text-right">${suggestion.suggestedCreditLimit.toLocaleString('ar-EG')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{suggestion.reasoning}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
        {!suggestions && !isLoading && debtors.length > 0 && (
            <p className="text-muted-foreground text-center py-4">{noSuggestionsPlaceholder}</p>
        )}
        {!suggestions && !isLoading && debtors.length === 0 && !loadingDebtors && (
            <p className="text-muted-foreground text-center py-4">{noDebtorsPlaceholder}</p>
        )}
      </CardContent>
    </Card>
  );
}
