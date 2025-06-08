
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { TransactionType } from "@/types/debt";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebtors } from "@/contexts/debtors-context";
import { useEffect } from "react";

const getTransactionTypes = (currentAmountOwed: number): { value: TransactionType; label: string, disabled?: boolean }[] => [
  { value: "new_credit", label: "دين جديد" },
  { value: "payment", label: "دفعة مستلمة" },
  { value: "full_settlement", label: "دفع كامل سداد", disabled: currentAmountOwed <= 0 },
];

const addTransactionFormSchema = z.object({
  type: z.custom<TransactionType>((val) => 
    ["new_credit", "payment", "full_settlement"].includes(val as TransactionType), {
    message: "نوع معاملة غير صالح",
  }),
  amount: z.coerce.number().min(0.01, { message: "يجب أن يكون المبلغ أكبر من 0." }),
  description: z.string().optional(),
});

type AddTransactionFormValues = z.infer<typeof addTransactionFormSchema>;

interface AddTransactionFormProps {
  debtorId: string;
  currentAmountOwed: number;
  onTransactionAdded: () => void;
}

export function AddTransactionForm({ debtorId, currentAmountOwed, onTransactionAdded }: AddTransactionFormProps) {
  const { addTransaction } = useDebtors();
  const transactionTypes = getTransactionTypes(currentAmountOwed);

  const form = useForm<AddTransactionFormValues>({
    resolver: zodResolver(addTransactionFormSchema),
    defaultValues: {
      type: "payment",
      amount: 0,
      description: "",
    },
  });

  const selectedType = form.watch("type");

  useEffect(() => {
    if (selectedType === "full_settlement" && currentAmountOwed > 0) {
      form.setValue("amount", currentAmountOwed, { shouldValidate: true });
    }
  }, [selectedType, currentAmountOwed, form]);
  
  function onSubmit(data: AddTransactionFormValues) {
    const submissionData = { ...data };
    if (data.type === "full_settlement") {
      // Ensure the amount is exactly the currentAmountOwed if type is full_settlement
      submissionData.amount = currentAmountOwed;
    }
    addTransaction(debtorId, submissionData);
    form.reset({ type: "payment", amount: 0, description: "" });
    onTransactionAdded();
  }
  
  const typeLabel = "نوع المعاملة";
  const amountLabel = "المبلغ (بالعملة المحلية)";
  const descriptionLabel = "الوصف (اختياري)";
  const descriptionPlaceholder = "مثال: دفعة شهرية، بضاعة مشتراة";
  const addButtonText = "إضافة معاملة";
  const addingButtonText = "جاري الإضافة...";
  const noDebtToSettleText = "لا يوجد دين قائم لتسويته بالكامل.";

  const isFullSettlementSelected = selectedType === "full_settlement";
  const disableSubmitForFullSettlement = isFullSettlementSelected && currentAmountOwed <= 0;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4 border-t pt-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{typeLabel}</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "full_settlement") {
                    // Reset amount if switching away from full_settlement
                    // form.setValue("amount", 0); 
                  }
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع المعاملة" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {transactionTypes.map((typeOpt) => (
                    <SelectItem key={typeOpt.value} value={typeOpt.value} disabled={typeOpt.disabled}>
                      {typeOpt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isFullSettlementSelected && currentAmountOwed <= 0 && (
                <p className="text-sm text-destructive pt-1">{noDebtToSettleText}</p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{amountLabel}</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="100.00" 
                  {...field} 
                  step="0.01" 
                  readOnly={isFullSettlementSelected && currentAmountOwed > 0}
                  disabled={isFullSettlementSelected && currentAmountOwed <= 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={descriptionPlaceholder} 
                  {...field} 
                  disabled={isFullSettlementSelected && currentAmountOwed <= 0}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting || disableSubmitForFullSettlement} 
          className="w-full"
        >
          {form.formState.isSubmitting ? addingButtonText : addButtonText}
        </Button>
      </form>
    </Form>
  );
}
