
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Debtor } from "@/types/debt";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useDebtors } from "@/contexts/debtors-context";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const addDebtorFormSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يتكون الاسم من حرفين على الأقل." }).max(50),
  phoneNumber: z.string().max(25, {message: "رقم الهاتف طويل جدًا."}).optional().or(z.literal('')),
  initialAmount: z.coerce.number().min(0, { message: "يجب أن يكون المبلغ الأولي المستحق موجبًا." }),
  creditLimit: z.coerce.number().min(0, { message: "يجب أن يكون الحد الائتماني موجبًا." }),
  paymentHistory: z.string().min(3, {message: "وصف سجل الدفع قصير جدًا."}).max(200, {message: "وصف سجل الدفع طويل جدًا."}),
  debtReason: z.string().max(200, { message: "سبب الدين طويل جدًا (200 حرف كحد أقصى)." }).optional().or(z.literal('')),
});

const editDebtorInfoFormSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يتكون الاسم من حرفين على الأقل." }).max(50),
  phoneNumber: z.string().max(25, {message: "رقم الهاتف طويل جدًا."}).optional().or(z.literal('')),
  creditLimit: z.coerce.number().min(0, { message: "يجب أن يكون الحد الائتماني موجبًا." }),
  paymentHistory: z.string().min(3, {message: "وصف سجل الدفع قصير جدًا."}).max(200, {message: "وصف سجل الدفع طويل جدًا."}),
});


type AddDebtorFormValues = z.infer<typeof addDebtorFormSchema>;
type EditDebtorInfoFormValues = z.infer<typeof editDebtorInfoFormSchema>;


interface DebtorFormProps {
  debtor?: Debtor;
  onFormSubmit?: () => void;
  triggerButton?: React.ReactNode;
}

export function DebtorForm({ debtor, onFormSubmit, triggerButton }: DebtorFormProps) {
  const { addDebtor, updateDebtorInfo } = useDebtors();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const isEditing = !!debtor;

  const formSchema = isEditing ? editDebtorInfoFormSchema : addDebtorFormSchema;

  const addTitle = "إضافة مدين جديد";
  const addDescription = "أدخل تفاصيل المدين الجديد ورصيده الأولي.";
  const editTitle = "تعديل معلومات المدين";
  const editDescription = "قم بتحديث تفاصيل الاتصال والحد الائتماني لهذا المدين. تتم إدارة المعاملات المالية في عرض كشف الحساب.";
  const nameLabel = "الاسم";
  const namePlaceholder = "فلان الفلاني";
  const phoneNumberLabel = "رقم الهاتف (اختياري)";
  const phoneNumberPlaceholder = "05xxxxxxxx";
  const initialAmountLabel = "المبلغ الأولي للدين (بالعملة المحلية)";
  const debtReasonLabel = "سبب الدين الأولي (اختياري)";
  const debtReasonPlaceholder = "مثال: سلفة شخصية، شراء بضاعة محددة";
  const creditLimitLabel = "الحد الائتماني (بالعملة المحلية)";
  const paymentHistoryLabel = "ملخص سجل الدفع";
  const paymentHistoryPlaceholder = "مثال: يدفع بانتظام في الوقت المحدد.";
  const cancelButton = "إلغاء";
  const addButtonText = "إضافة مدين";
  const saveButtonText = "حفظ التغييرات";
  const savingButtonText = "جاري الحفظ...";

  const toastDebtorUpdatedTitle = "تم تحديث معلومات المدين";
  const toastDebtorUpdatedDescription = (name: string) => `تم تحديث معلومات ${name}.`;
  const toastDebtorAddedTitle = "تمت إضافة المدين";
  const toastDebtorAddedDescription = (name: string) => `تمت إضافة ${name} برصيد أولي.`;
  const toastErrorTitle = "خطأ";

  const form = useForm<AddDebtorFormValues | EditDebtorInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing ? {
      name: debtor.name,
      phoneNumber: debtor.phoneNumber || "",
      creditLimit: debtor.creditLimit,
      paymentHistory: debtor.paymentHistory,
    } : {
      name: "",
      phoneNumber: "",
      initialAmount: 0,
      debtReason: "",
      creditLimit: 0,
      paymentHistory: "",
    },
  });

  useEffect(() => {
    if (isOpen) { 
      if (isEditing && debtor) {
        form.reset({
          name: debtor.name,
          phoneNumber: debtor.phoneNumber || "",
          creditLimit: debtor.creditLimit,
          paymentHistory: debtor.paymentHistory,
        });
      } else {
        form.reset({ name: "", phoneNumber: "", initialAmount: 0, debtReason: "", creditLimit: 0, paymentHistory: ""});
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debtor, isEditing, isOpen]);

  function onSubmit(data: AddDebtorFormValues | EditDebtorInfoFormValues) {
    try {
      if (isEditing && debtor) {
        updateDebtorInfo(debtor.id, data as EditDebtorInfoFormValues);
        toast({ title: toastDebtorUpdatedTitle, description: toastDebtorUpdatedDescription(data.name) });
      } else {
        const addData = data as AddDebtorFormValues;
        addDebtor(addData);
        toast({ title: toastDebtorAddedTitle, description: toastDebtorAddedDescription(data.name) });
      }
      setIsOpen(false);
      if (onFormSubmit) onFormSubmit();
      form.reset();
    } catch (error: any) {
      toast({ title: toastErrorTitle, description: error.message, variant: "destructive" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || <Button>{addTitle}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline">{isEditing ? editTitle : addTitle}</DialogTitle>
          <DialogDescription>
            {isEditing ? editDescription : addDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{nameLabel}</FormLabel>
                  <FormControl>
                    <Input placeholder={namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{phoneNumberLabel}</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder={phoneNumberPlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
             {!isEditing && (
                <FormField
                  control={form.control}
                  // @ts-ignore 
                  name="initialAmount" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{initialAmountLabel}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="creditLimit"
                render={({ field }) => (
                  <FormItem className={isEditing || !form.getValues("initialAmount" as keyof AddDebtorFormValues) ? "col-span-2" : ""}>
                    <FormLabel>{creditLimitLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {!isEditing && (
               <FormField
                control={form.control}
                 // @ts-ignore 
                name="debtReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{debtReasonLabel}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={debtReasonPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             {isEditing && (
                 <FormItem>
                    <FormLabel>المبلغ الحالي المستحق</FormLabel>
                    <Input type="text" value={`$${debtor?.amountOwed.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} readOnly disabled className="bg-muted/50"/>
                    <FormDescription>يتم احتساب هذا المبلغ من المعاملات. أضف الدفعات أو الائتمان الجديد عبر "عرض كشف الحساب".</FormDescription>
                 </FormItem>
             )}
            <FormField
              control={form.control}
              name="paymentHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{paymentHistoryLabel}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={paymentHistoryPlaceholder} {...field} />
                  </FormControl>
                  <FormDescription>ملخص عام لسلوك الدفع للرجوع السريع أو تحليل الذكاء الاصطناعي.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => form.reset()}>{cancelButton}</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? savingButtonText : (isEditing ? saveButtonText : addButtonText)}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
