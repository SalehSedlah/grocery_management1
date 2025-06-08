
"use client";

import type { Product } from "@/types/grocery";
import { useProducts } from "@/contexts/products-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, AlertTriangle, CalendarX, CalendarCheck2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductForm } from "./product-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "../ui/skeleton";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function ProductList() {
  const { products, deleteProduct, loadingProducts } = useProducts();

  const noProductsText = "لم تقم بإضافة أي أصناف بعد. ابدأ بإضافة صنف جديد.";
  const nameHeader = "الاسم";
  const categoryHeader = "الفئة";
  const purchasePriceHeader = "سعر الشراء";
  const salePriceHeader = "سعر البيع";
  const currentStockHeader = "الكمية المتوفرة";
  const quantitySoldHeader = "الكمية المباعة";
  const totalValueHeader = "قيمة المخزون (بيع)";
  const expiryDateHeader = "تاريخ الانتهاء";
  const statusHeader = "الحالة";
  const actionsHeader = "الإجراءات";
  
  const statusLowStock = "مخزون منخفض";
  const statusInStock = "متوفر";
  const statusOutOfStock = "نفد المخزون";
  const statusExpired = "منتهي الصلاحية";
  const statusNearingExpiry = "قارب على الانتهاء";

  const editActionText = "تعديل";
  const deleteActionText = "حذف";
  const deleteDialogTitle = "هل أنت متأكد؟";
  const deleteDialogDescription = (name: string) => `لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف المنتج: ${name} بشكل دائم.`;
  const deleteDialogCancel = "إلغاء";
  const deleteDialogConfirm = "حذف";

  const totalStockSaleValueLabel = "إجمالي قيمة المخزون (بسعر البيع):";
  const totalStockPurchaseCostLabel = "إجمالي تكلفة المخزون (بسعر الشراء):";
  const potentialStockProfitLabel = "إجمالي الربح المحتمل من المخزون الحالي:";


  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== 'number' || !isFinite(amount)) {
      return (0).toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "لا يوجد";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "تاريخ غير صالح";
      return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return "تاريخ غير صالح";
    }
  };

  const getExpiryStatus = (expiryDateString?: string): { text: string; variant: "default" | "secondary" | "destructive" | "outline", icon?: React.ElementType } | null => {
    if (!expiryDateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today to start of day
    
    try {
        const expiryDate = new Date(expiryDateString);
        if (isNaN(expiryDate.getTime())) return { text: "تاريخ غير صالح", variant: "outline" };
        expiryDate.setHours(0,0,0,0); // Normalize expiry date

        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
        return { text: statusExpired, variant: "destructive", icon: CalendarX };
        }
        if (diffDays <= 7) {
        return { text: statusNearingExpiry, variant: "secondary", icon: CalendarCheck2 }; // Yellow-ish
        }
        return null; // Still valid, no special status
    } catch(e) {
        return { text: "خطأ بالتاريخ", variant: "outline" };
    }
  };


  const totalStockSaleValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.pricePerUnit) || 0) * (Number(p.currentStock) || 0)), 0);
  }, [products]);
  
  const totalStockPurchaseCost = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.purchasePricePerUnit) || 0) * (Number(p.currentStock) || 0)), 0);
  }, [products]);

  const potentialStockProfit = useMemo(() => {
    return totalStockSaleValue - totalStockPurchaseCost;
  }, [totalStockSaleValue, totalStockPurchaseCost]);


  if (loadingProducts) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (products.length === 0 && !loadingProducts) {
    return <p className="text-center text-muted-foreground py-8">{noProductsText}</p>;
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameHeader}</TableHead>
              <TableHead>{categoryHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{purchasePriceHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{salePriceHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{currentStockHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{quantitySoldHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{totalValueHeader}</TableHead>
              <TableHead>{expiryDateHeader}</TableHead>
              <TableHead>{statusHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{actionsHeader}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const currentStockNum = Number(product.currentStock) || 0;
              const lowStockThresholdNum = Number(product.lowStockThreshold) || 0;
              const piecesInUnitNum = product.piecesInUnit !== undefined ? Number(product.piecesInUnit) : 0;
              const quantitySoldNum = Number(product.quantitySold) || 0;

              const isLowStock = currentStockNum > 0 && currentStockNum <= lowStockThresholdNum;
              const isOutOfStock = currentStockNum === 0;
              const productTotalValue = (Number(product.pricePerUnit) || 0) * currentStockNum;
              const expiryStatus = getExpiryStatus(product.expiryDate);
              
              let stockStatusBadge;
              if (isOutOfStock) {
                  stockStatusBadge = <Badge variant="destructive" className="flex items-center gap-1 w-fit"><AlertTriangle className="h-3 w-3" />{statusOutOfStock}</Badge>;
              } else if (isLowStock) {
                  stockStatusBadge = <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-yellow-500 text-black hover:bg-yellow-600"><AlertTriangle className="h-3 w-3" />{statusLowStock}</Badge>;
              } else {
                  stockStatusBadge = <Badge variant="default" className="bg-green-600 hover:bg-green-700">{statusInStock}</Badge>;
              }

              const displayQuantity = () => {
                const stockStr = currentStockNum.toLocaleString('ar-EG');
                if (piecesInUnitNum && piecesInUnitNum > 0) {
                  const totalPiecesStr = (currentStockNum * piecesInUnitNum).toLocaleString('ar-EG');
                  return `${stockStr} ${product.unit} (${totalPiecesStr} قطعة)`;
                }
                return `${stockStr} ${product.unit}`;
              };
              
              return (
                <TableRow key={product.id} className={isOutOfStock ? "bg-destructive/10" : (isLowStock ? "bg-yellow-500/10" : "")}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="text-left rtl:text-right">{formatCurrency(product.purchasePricePerUnit)}</TableCell>
                  <TableCell className="text-left rtl:text-right">{formatCurrency(product.pricePerUnit)}</TableCell>
                  <TableCell className="text-left rtl:text-right font-semibold">{displayQuantity()}</TableCell>
                  <TableCell className="text-left rtl:text-right">{quantitySoldNum.toLocaleString('ar-EG')} {product.unit}</TableCell>
                  <TableCell className="text-left rtl:text-right font-semibold">{formatCurrency(productTotalValue)}</TableCell>
                  <TableCell>
                    {expiryStatus ? (
                      <Badge variant={expiryStatus.variant} className="flex items-center gap-1 w-fit">
                        {expiryStatus.icon && <expiryStatus.icon className="h-3 w-3" />}
                        {expiryStatus.text}
                      </Badge>
                    ) : (
                      formatDate(product.expiryDate)
                    )}
                  </TableCell>
                  <TableCell>{stockStatusBadge}</TableCell>
                  <TableCell className="text-left rtl:text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة لـ {product.name}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <ProductForm
                          product={product}
                          triggerButton={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {editActionText}
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash2 className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {deleteActionText}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{deleteDialogTitle}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {deleteDialogDescription(product.name)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{deleteDialogCancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id, product.name)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                {deleteDialogConfirm}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {products.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{totalStockSaleValueLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(totalStockSaleValue)}</p>
                    <p className="text-xs text-muted-foreground mt-1">القيمة الإجمالية للمخزون إذا تم بيعه بالأسعار الحالية.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{totalStockPurchaseCostLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totalStockPurchaseCost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">التكلفة الإجمالية لشراء المخزون الحالي.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{potentialStockProfitLabel}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className={`text-2xl font-bold ${potentialStockProfit >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {formatCurrency(potentialStockProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">الفرق بين قيمة البيع وتكلفة الشراء للمخزون الحالي.</p>
                </CardContent>
            </Card>
        </div>
      )}
    </>
  );
}

    