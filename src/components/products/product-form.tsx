
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { Product } from "@/types/grocery";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProducts } from "@/contexts/products-context";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

const unitOptions = [
  { value: "قطعة", label: "قطعة" },
  { value: "علبة", label: "علبة" },
  { value: "كرتون", label: "كرتون" },
  { value: "كيس", label: "كيس" },
  { value: "شوال", label: "شوال (خيشة كبيرة)" },
  { value: "صندوق", label: "صندوق" },
  { value: "درزن", label: "درزن (12 قطعة)" },
  { value: "حزمة", label: "حزمة" },
  { value: "كجم", label: "كيلوجرام (كجم)" },
  { value: "جرام", label: "جرام (جم)" },
  { value: "لتر", label: "لتر (ل)" },
  { value: "مل", label: "مليلتر (مل)" },
];

const containerUnits = ["كرتون", "صندوق", "درزن", "حزمة", "شوال"];

const productFormSchemaBase = z.object({
  name: z.string().min(2, { message: "يجب أن يتكون اسم المنتج من حرفين على الأقل." }).max(100),
  category: z.string().min(2, { message: "يجب أن تتكون الفئة من حرفين على الأقل." }).max(50),
  unit: z.string().min(1, { message: "وحدة القياس مطلوبة."}),
  pricePerUnit: z.coerce.number().min(0, { message: "يجب أن يكون سعر البيع موجبًا أو صفرًا." }),
  purchasePricePerUnit: z.coerce.number().min(0, { message: "يجب أن يكون سعر الشراء موجبًا أو صفرًا." }),
  currentStock: z.coerce.number().min(0, { message: "لا يمكن أن يكون المخزون سالبًا." }),
  lowStockThreshold: z.coerce.number().min(0, { message: "لا يمكن أن يكون حد المخزون المنخفض سالبًا." }),
  piecesInUnit: z.coerce.number().min(0, {message: "عدد القطع يجب أن يكون موجباً أو صفراً."}).optional().nullable(),
  expiryDate: z.string().optional().nullable(), // YYYY-MM-DD format
  quantitySold: z.coerce.number().min(0, { message: "الكمية المباعة لا يمكن أن تكون سالبة." }),
});

const productFormSchema = productFormSchemaBase.superRefine((data, ctx) => {
  if (containerUnits.includes(data.unit) && (data.piecesInUnit === null || data.piecesInUnit === undefined || data.piecesInUnit <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "يجب إدخال عدد قطع صحيح (أكبر من صفر) للوحدات الحاوية مثل الكرتون أو الصندوق.",
      path: ["piecesInUnit"],
    });
  }
  if (!containerUnits.includes(data.unit) && data.piecesInUnit !== null && data.piecesInUnit !== undefined) {
    // This case is handled by form logic resetting piecesInUnit, but good to have as a fallback
    // data.piecesInUnit = null; // Not directly mutable here, handled by form logic
  }
});


type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  product?: Product;
  onFormSubmit?: () => void;
  triggerButton?: React.ReactNode;
}

export function ProductForm({ product, onFormSubmit, triggerButton }: ProductFormProps) {
  const { addProduct, updateProduct } = useProducts();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string>(product?.unit || unitOptions[0].value);

  const isEditing = !!product;

  const addTitle = "إضافة صنف جديد";
  const addDescription = "أدخل تفاصيل الصنف الجديد، بما في ذلك اسمه، سعره، والكمية المتوفرة.";
  const editTitle = "تعديل الصنف";
  const editDescription = "قم بتحديث تفاصيل الصنف.";
  
  const nameLabel = "اسم الصنف";
  const namePlaceholder = "مثال: سكر، دقيق، زيت";
  const categoryLabel = "الفئة";
  const categoryPlaceholder = "مثال: فواكه، حبوب، ألبان";
  const unitLabel = "وحدة القياس الرئيسية";
  
  const getPricePerUnitLabel = (unit: string) => `سعر بيع الـ${unit} (بالعملة المحلية)`;
  const getPurchasePricePerUnitLabel = (unit: string) => `سعر شراء الـ${unit} (بالعملة المحلية)`;
  const pricePerUnitDescription = (unit: string) => `أدخل سعر البيع للـ${unit} المحدد كوحدة رئيسية.`;
  
  const getCurrentStockLabel = (unit: string) => `الكمية المتوفرة (بالـ${unit})`;
  const getLowStockThresholdLabel = (unit: string) => `حد المخزون المنخفض (بالـ${unit})`;
  
  const piecesInUnitLabel = (unit: string) => `عدد القطع الفرعية في الـ${unit} (إن وجدت)`;
  const piecesInUnitDescription = "مثال: إذا كانت الوحدة 'كرتونة شاي' وتحتوي على 12 علبة، أدخل 12. أو إذا كانت الوحدة 'شوال أرز' ويحتوي على 5 أكياس صغيرة (كل كيس 10 كجم مثلاً)، أدخل 5. اتركه فارغًا إذا كانت الوحدة هي نفسها القطعة/الكيس المفرد الذي تبيعه وتُسعّره.";
  const piecesInUnitPlaceholder = "12";

  const expiryDateLabel = "تاريخ الانتهاء (اختياري)";
  const quantitySoldLabel = "الكمية المباعة (بالوحدة الرئيسية)";
  const quantitySoldDescription = "إجمالي الكمية المباعة من هذا المنتج بالوحدة الرئيسية. (للتتبع اليدوي أو يتم تحديثها عبر عمليات البيع).";
  
  const cancelButton = "إلغاء";
  const addButtonText = "إضافة";
  const saveButtonText = "حفظ التغييرات";
  const savingButtonText = "جاري الحفظ...";

  const toastErrorTitle = "خطأ";

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEditing && product ? {
      name: product.name,
      category: product.category,
      unit: product.unit,
      pricePerUnit: product.pricePerUnit,
      purchasePricePerUnit: product.purchasePricePerUnit,
      currentStock: product.currentStock,
      lowStockThreshold: product.lowStockThreshold,
      piecesInUnit: product.piecesInUnit ?? null,
      expiryDate: product.expiryDate ?? null,
      quantitySold: product.quantitySold,
    } : {
      name: "",
      category: "",
      unit: unitOptions[0].value,
      pricePerUnit: 0,
      purchasePricePerUnit: 0,
      currentStock: 0,
      lowStockThreshold: 0,
      piecesInUnit: null,
      expiryDate: null,
      quantitySold: 0,
    },
  });

  useEffect(() => {
    if (isEditing && product) {
      setSelectedUnit(product.unit);
    }
  }, [product, isEditing]);
  
  useEffect(() => {
    const currentFormUnit = form.getValues("unit");
    if (selectedUnit !== currentFormUnit) {
      setSelectedUnit(currentFormUnit);
    }
    if (!containerUnits.includes(selectedUnit)) {
      form.setValue("piecesInUnit", null, { shouldValidate: true });
    }
  }, [selectedUnit, form.watch("unit"), form]);


  useEffect(() => {
    if (isOpen) { 
      if (isEditing && product) {
        form.reset({
          name: product.name,
          category: product.category,
          unit: product.unit,
          pricePerUnit: product.pricePerUnit,
          purchasePricePerUnit: product.purchasePricePerUnit,
          currentStock: product.currentStock,
          lowStockThreshold: product.lowStockThreshold,
          piecesInUnit: product.piecesInUnit ?? null,
          expiryDate: product.expiryDate ?? null,
          quantitySold: product.quantitySold,
        });
        setSelectedUnit(product.unit);
      } else {
        const defaultUnit = unitOptions[0].value;
        form.reset({ name: "", category: "", unit: defaultUnit, pricePerUnit: 0, purchasePricePerUnit: 0, currentStock: 0, lowStockThreshold: 0, piecesInUnit: null, expiryDate: null, quantitySold: 0 });
        setSelectedUnit(defaultUnit);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isEditing, isOpen]);

  function onSubmit(data: ProductFormValues) {
    try {
      const processedData: Omit<Product, "id" | "lastUpdated" | "userId"> & { quantitySold?: number} = {
        ...data,
        pricePerUnit: Number(data.pricePerUnit) || 0,
        purchasePricePerUnit: Number(data.purchasePricePerUnit) || 0,
        currentStock: Number(data.currentStock) || 0,
        lowStockThreshold: Number(data.lowStockThreshold) || 0,
        piecesInUnit: containerUnits.includes(data.unit) && data.piecesInUnit !== null && data.piecesInUnit !== undefined ? (Number(data.piecesInUnit) || 0) : undefined,
        expiryDate: data.expiryDate === null || data.expiryDate === "" ? undefined : data.expiryDate,
        quantitySold: Number(data.quantitySold) || 0,
      };


      if (isEditing && product) {
        updateProduct(product.id, processedData);
      } else {
        const { quantitySold, ...addData } = processedData; // quantitySold is handled by addProduct context (defaults to 0)
        addProduct(addData as Omit<Product, "id" | "lastUpdated" | "userId" | "quantitySold">);
      }
      setIsOpen(false);
      if (onFormSubmit) onFormSubmit();
    } catch (error: any) {
      toast({ title: toastErrorTitle, description: error.message, variant: "destructive" });
    }
  }
  
  const showPiecesInUnitField = containerUnits.includes(selectedUnit);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || <Button>{addTitle}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{categoryLabel}</FormLabel>
                    <FormControl>
                      <Input placeholder={categoryPlaceholder} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{unitLabel}</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setSelectedUnit(value); }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر وحدة القياس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="pricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getPricePerUnitLabel(selectedUnit)}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormDescription>{pricePerUnitDescription(selectedUnit)}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchasePricePerUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getPurchasePricePerUnitLabel(selectedUnit)}</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} step="0.01" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showPiecesInUnitField && (
              <FormField
                control={form.control}
                name="piecesInUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{piecesInUnitLabel(selectedUnit)}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={piecesInUnitPlaceholder} 
                            {...field} 
                            onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)}
                            value={field.value ?? ""} 
                      />
                    </FormControl>
                    <FormDescription>{piecesInUnitDescription}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currentStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getCurrentStockLabel(selectedUnit)}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getLowStockThresholdLabel(selectedUnit)}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
                control={form.control}
                name="quantitySold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{quantitySoldLabel}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} readOnly={!isEditing} disabled={!isEditing} />
                    </FormControl>
                    <FormDescription>{quantitySoldDescription}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            
             <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{expiryDateLabel}</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value ?? ""}
                      onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); }}>{cancelButton}</Button>
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
