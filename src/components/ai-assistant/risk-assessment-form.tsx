
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assessDebtorRisk, type DebtorRiskAssessmentInput, type DebtorRiskAssessmentOutput } from "@/ai/flows/debtor-risk-assessment";
import { useDebtors } from "@/contexts/debtors-context";
import { useToast } from "@/hooks/use-toast";
import type { Debtor } from "@/types/debt";
import { Sparkles, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const riskAssessmentFormSchema = z.object({
  debtorId: z.string().optional(), 
  paymentBehavior: z.string().min(10, { message: "وصف سلوك الدفع قصير جدًا." }).max(500),
  creditScore: z.coerce.number().min(300).max(850).optional(),
  debtAmount: z.coerce.number().min(0),
  creditLimit: z.coerce.number().min(0).optional(),
});

type RiskAssessmentFormValues = z.infer<typeof riskAssessmentFormSchema>;

export function RiskAssessmentForm() {
  const { debtors, getDebtorById } = useDebtors();
  const { toast } = useToast();
  const [assessmentResult, setAssessmentResult] = useState<DebtorRiskAssessmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDebtor, setSelectedDebtor] = useState<Debtor | null>(null);

  const cardTitle = "تقييم مخاطر المدين";
  const cardDescription = "حلل ملف مخاطر المدين باستخدام الذكاء الاصطناعي.";
  const selectDebtorLabel = "اختر مدين (اختياري)";
  const selectDebtorPlaceholder = "اختر مدينًا أو أدخل يدويًا";
  const selectDebtorManualOption = "إدخال يدوي";
  const selectDebtorDescription = "اختر مدينًا موجودًا لملء بعض الحقول مسبقًا، أو اختر \"إدخال يدوي\".";
  const paymentBehaviorLabel = "سلوك الدفع";
  const paymentBehaviorPlaceholder = "مثال: يدفع باستمرار في الوقت المحدد، مدفوعات متأخرة عرضية...";
  const debtAmountLabel = "مبلغ الدين (بالعملة المحلية)";
  const creditLimitLabel = "الحد الائتماني (بالعملة المحلية) (اختياري)";
  const creditScoreLabel = "درجة الائتمان (اختياري)";
  const creditScorePlaceholder = "300-850";
  const assessRiskButtonText = "تقييم المخاطر";
  const assessingRiskButtonText = "جاري تقييم المخاطر...";
  const resultTitle = "نتيجة التقييم:";
  const riskLevelLabel = "مستوى المخاطرة:";
  const riskFactorsLabel = "عوامل المخاطرة:";
  const suggestedActionsLabel = "الإجراءات المقترحة:";
  const toastAssessmentCompleteTitle = "اكتمل تقييم المخاطر";
  const toastAssessmentCompleteDescription = "انتهى تحليل الذكاء الاصطناعي.";
  const toastAssessmentFailedTitle = "فشل التقييم";

  const form = useForm<RiskAssessmentFormValues>({
    resolver: zodResolver(riskAssessmentFormSchema),
    defaultValues: {
      paymentBehavior: "",
      debtAmount: 0,
    },
  });

  const handleDebtorSelect = (debtorId: string) => {
    if (debtorId === "manual") {
      setSelectedDebtor(null);
      form.reset({
        paymentBehavior: "",
        debtAmount: 0,
        creditScore: undefined,
        creditLimit: undefined,
      });
    } else {
      const debtor = getDebtorById(debtorId);
      setSelectedDebtor(debtor || null);
      if (debtor) {
        form.reset({
          debtorId: debtor.id,
          paymentBehavior: debtor.paymentHistory || "",
          debtAmount: debtor.amountOwed,
          creditLimit: debtor.creditLimit,
        });
      }
    }
  };

  async function onSubmit(data: RiskAssessmentFormValues) {
    setIsLoading(true);
    setAssessmentResult(null);
    try {
      const input: DebtorRiskAssessmentInput = {
        paymentBehavior: data.paymentBehavior,
        creditScore: data.creditScore,
        debtAmount: data.debtAmount,
        creditLimit: data.creditLimit,
      };
      const result = await assessDebtorRisk(input);
      setAssessmentResult(result);
      toast({ title: toastAssessmentCompleteTitle, description: toastAssessmentCompleteDescription });
    } catch (error: any) {
      toast({ title: toastAssessmentFailedTitle, description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-headline flex items-center">
          <Sparkles className="ml-2 rtl:mr-0 rtl:ml-2 h-5 w-5 text-primary" />{cardTitle}
        </CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="debtorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{selectDebtorLabel}</FormLabel>
                  <Select onValueChange={(value) => {field.onChange(value); handleDebtorSelect(value);}} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={selectDebtorPlaceholder} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="manual">{selectDebtorManualOption}</SelectItem>
                      {debtors.map((debtor) => (
                        <SelectItem key={debtor.id} value={debtor.id}>
                          {debtor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{selectDebtorDescription}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentBehavior"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{paymentBehaviorLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={paymentBehaviorPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="debtAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{debtAmountLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{creditLimitLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="creditScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{creditScoreLabel}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder={creditScorePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? assessingRiskButtonText : assessRiskButtonText}
            </Button>
          </form>
        </Form>

        {isLoading && (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/4 mt-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}

        {assessmentResult && !isLoading && (
          <div className="mt-8 space-y-4 p-4 border rounded-md bg-secondary/30">
            <h3 className="text-lg font-semibold font-headline text-foreground">{resultTitle}</h3>
            <div>
              <p className="font-medium text-foreground flex items-center">
                {riskLevelLabel}
                <span className={`mr-2 rtl:ml-0 rtl:mr-2 font-bold ${
                  assessmentResult.riskLevel.toLowerCase() === 'high' ? 'text-destructive' :
                  assessmentResult.riskLevel.toLowerCase() === 'medium' ? 'text-yellow-500' :
                  'text-green-600'
                }`}>
                  {assessmentResult.riskLevel.toLowerCase() === 'high' && <AlertTriangle className="inline h-4 w-4 ml-1 rtl:mr-0 rtl:ml-1"/>}
                  {assessmentResult.riskLevel}
                </span>
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">{riskFactorsLabel}</p>
              <p className="text-sm text-muted-foreground">{assessmentResult.riskFactors}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{suggestedActionsLabel}</p>
              <p className="text-sm text-muted-foreground">{assessmentResult.suggestedActions}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
