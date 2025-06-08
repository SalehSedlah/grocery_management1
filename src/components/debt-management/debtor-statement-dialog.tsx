
"use client";

import type { Debtor } from "@/types/debt";
import { useDebtors } from "@/contexts/debtors-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { AddTransactionForm } from "./add-transaction-form";
import { DebtorStatementView } from "./debtor-statement-view"; // Import the new view component
import { useState, useEffect } from "react";

interface DebtorStatementDialogProps {
  debtor: Debtor | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DebtorStatementDialog({ debtor: initialDebtor, isOpen, onOpenChange }: DebtorStatementDialogProps) {
  const { getDebtorById } = useDebtors();
  const [showAddTransactionForm, setShowAddTransactionForm] = useState(false);
  const [currentDebtor, setCurrentDebtor] = useState<Debtor | null>(initialDebtor);

  useEffect(() => {
    if (initialDebtor?.id) {
      const updatedDebtorFromContext = getDebtorById(initialDebtor.id);
      setCurrentDebtor(updatedDebtorFromContext || null);
    } else {
      setCurrentDebtor(null);
    }
  }, [initialDebtor, getDebtorById, isOpen]);


  const dialogTitle = "كشف حساب المدين";
  const debtorNameLabel = "المدين:";
  const currentBalanceLabel = "الرصيد الحالي:";
  const addTransactionButtonText = "إضافة معاملة جديدة";
  const closeButtonText = "إغلاق";

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || !isFinite(amount)) {
      amount = 0; 
    }
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' });
  };

  const handleTransactionAdded = () => {
    setShowAddTransactionForm(false);
    if (currentDebtor?.id) {
      const updatedDebtor = getDebtorById(currentDebtor.id);
      setCurrentDebtor(updatedDebtor || null);
    }
  };

  if (!currentDebtor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-card">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{dialogTitle}</DialogTitle>
          <DialogDescription>
            {debtorNameLabel} <span className="font-semibold">{currentDebtor.name}</span> | {currentBalanceLabel} <span className="font-semibold text-lg">{formatCurrency(currentDebtor.amountOwed)}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <Button onClick={() => setShowAddTransactionForm(!showAddTransactionForm)} variant="outline">
            {showAddTransactionForm ? "إلغاء إضافة معاملة" : addTransactionButtonText}
          </Button>
          {showAddTransactionForm && (
            <AddTransactionForm 
                debtorId={currentDebtor.id} 
                currentAmountOwed={currentDebtor.amountOwed} 
                onTransactionAdded={handleTransactionAdded} 
            />
          )}
        </div>

        <DebtorStatementView debtor={currentDebtor} maxHeight="300px" />
        
        <DialogClose asChild className="mt-6">
          <Button type="button" variant="outline">{closeButtonText}</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

