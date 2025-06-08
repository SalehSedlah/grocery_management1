
"use client";

import type { Debtor } from "@/types/debt";
import { useDebtors } from "@/contexts/debtors-context";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2, AlertTriangle, MessageSquare, MessageCircle, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DebtorForm } from "./debtor-form";
import { DebtorStatementDialog } from "./debtor-statement-dialog"; 
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
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useState } from "react";

export function DebtorList() {
  const { debtors, deleteDebtor, loadingDebtors } = useDebtors();
  const { toast } = useToast();
  const [statementDebtor, setStatementDebtor] = useState<Debtor | null>(null);

  const noDebtorsText = "لم يتم العثور على مدينين. قم بإضافة مدين جديد للبدء.";
  const nameHeader = "الاسم";
  const phoneNumberHeader = "رقم الهاتف";
  const amountOwedHeader = "المبلغ المستحق";
  const creditLimitHeader = "الحد الائتماني";
  const statusHeader = "الحالة";
  const lastUpdatedHeader = "آخر تحديث";
  const actionsHeader = "الإجراءات";
  const statusOverLimit = "تجاوز الحد";
  const statusWithinLimit = "ضمن الحد";
  const editActionText = "تعديل المعلومات";
  const viewStatementActionText = "عرض كشف الحساب";
  const deleteActionText = "حذف";
  const sendSmsActionText = "إرسال SMS";
  const sendWhatsAppActionText = "إرسال WhatsApp";
  const deleteDialogTitle = "هل أنت متأكد؟";
  const deleteDialogDescription = (name: string) => `لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف سجل ${name} وجميع المعاملات المرتبطة به بشكل دائم.`;
  const deleteDialogCancel = "إلغاء";
  const deleteDialogConfirm = "حذف";
  const toastDebtorDeletedTitle = "تم حذف المدين";
  const toastDebtorDeletedDescription = (name: string) => `تم حذف ${name}.`;

  const handleDelete = (id: string, name: string) => {
    deleteDebtor(id);
    toast({ title: toastDebtorDeletedTitle, description: toastDebtorDeletedDescription(name) });
  };

  if (loadingDebtors) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (debtors.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{noDebtorsText}</p>;
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{nameHeader}</TableHead>
              <TableHead>{phoneNumberHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{amountOwedHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{creditLimitHeader}</TableHead>
              <TableHead>{statusHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{lastUpdatedHeader}</TableHead>
              <TableHead className="text-left rtl:text-right">{actionsHeader}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.map((debtor) => {
              const isOverLimit = debtor.amountOwed > debtor.creditLimit;
              const amountOwedFormatted = debtor.amountOwed.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' }); // Assuming SAR for Arabic
              const creditLimitFormatted = debtor.creditLimit.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' });
              const lastUpdatedFormatted = new Date(debtor.lastUpdated).toLocaleDateString('ar-EG');
              
              return (
                <TableRow key={debtor.id} className={isOverLimit ? "bg-destructive/10 hover:bg-destructive/20" : ""}>
                  <TableCell className="font-medium">{debtor.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{debtor.phoneNumber || "غير متاح"}</TableCell>
                  <TableCell className="text-left rtl:text-right">{amountOwedFormatted}</TableCell>
                  <TableCell className="text-left rtl:text-right">{creditLimitFormatted}</TableCell>
                  <TableCell>
                    {isOverLimit ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                        <AlertTriangle className="h-3 w-3" />
                        {statusOverLimit}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{statusWithinLimit}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-left rtl:text-right text-sm text-muted-foreground">{lastUpdatedFormatted}</TableCell>
                  <TableCell className="text-left rtl:text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">فتح القائمة</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start"> {/* Changed align to start for RTL */}
                        <DropdownMenuItem onSelect={() => setStatementDebtor(debtor)}>
                          <FileText className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {viewStatementActionText}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DebtorForm
                          debtor={debtor}
                          triggerButton={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Edit className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {editActionText}
                            </DropdownMenuItem>
                          }
                        />
                         {debtor.phoneNumber && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <a href={`sms:${debtor.phoneNumber}`}>
                                <MessageSquare className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {sendSmsActionText}
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`https://wa.me/${debtor.phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                                <MessageCircle className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {sendWhatsAppActionText}
                              </a>
                            </DropdownMenuItem>
                          </>
                        )}
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
                                {deleteDialogDescription(debtor.name)}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{deleteDialogCancel}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(debtor.id, debtor.name)}
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
      {statementDebtor && (
        <DebtorStatementDialog 
          debtor={statementDebtor} 
          isOpen={!!statementDebtor} 
          onOpenChange={(open) => { if(!open) setStatementDebtor(null); }} 
        />
      )}
    </>
  );
}
