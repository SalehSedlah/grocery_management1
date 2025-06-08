
"use client";

import type { Debtor, Transaction } from "@/types/debt";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface DebtorStatementViewProps {
  debtor: Debtor | null;
  maxHeight?: string; // e.g., "300px", "500px"
}

export function DebtorStatementView({ debtor, maxHeight = "400px" }: DebtorStatementViewProps) {
  const transactionsHeader = "المعاملات";
  const dateHeader = "التاريخ";
  const typeHeader = "النوع";
  const descriptionHeader = "الوصف";
  const amountHeader = "المبلغ";
  const runningBalanceHeader = "الرصيد";
  const noTransactionsText = "لا توجد معاملات مسجلة لهذا المدين حتى الآن.";

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || !isFinite(amount)) {
      amount = 0;
    }
    return amount.toLocaleString('ar-EG', { style: 'currency', currency: 'SAR' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const transactionTypeLabels: Record<Transaction['type'], string> = {
    initial_balance: "رصيد افتتاحي",
    payment: "دفعة",
    new_credit: "دين جديد",
    adjustment_increase: "تسوية (زيادة)",
    adjustment_decrease: "تسوية (نقصان)",
    full_settlement: "دفع كامل سداد",
  };
  
  const sortedTransactions = useMemo(() => {
    if (!debtor || !debtor.transactions) return [];
    return [...debtor.transactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) {
            return dateA - dateB;
        }
        return a.id.localeCompare(b.id);
    });
  }, [debtor]);

  const transactionsWithRunningBalance = useMemo(() => {
    let runningBalance = 0;
    return sortedTransactions.map(tx => {
      let newRunningBalance = runningBalance;
      const currentTxAmount = Number(tx.amount);

      if (isNaN(currentTxAmount) || !isFinite(currentTxAmount)) {
        // Keep runningBalance as is
      } else {
        switch (tx.type) {
          case 'initial_balance':
          case 'new_credit':
          case 'adjustment_increase':
            newRunningBalance += currentTxAmount;
            break;
          case 'payment':
          case 'adjustment_decrease':
          case 'full_settlement':
            newRunningBalance -= currentTxAmount;
            break;
        }
      }
      runningBalance = parseFloat(newRunningBalance.toFixed(2));
      return { ...tx, runningBalance, amount: currentTxAmount };
    });
  }, [sortedTransactions]);

  if (!debtor) {
    return <p className="text-muted-foreground text-center py-4">{noTransactionsText}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-2">{transactionsHeader}</h3>
      {transactionsWithRunningBalance.length > 0 ? (
        <ScrollArea className="border rounded-md" style={{ height: maxHeight }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{dateHeader}</TableHead>
                <TableHead>{typeHeader}</TableHead>
                <TableHead>{descriptionHeader}</TableHead>
                <TableHead className="text-left rtl:text-right">{amountHeader}</TableHead>
                <TableHead className="text-left rtl:text-right">{runningBalanceHeader}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionsWithRunningBalance.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(tx.date)}</TableCell>
                  <TableCell>
                     <Badge variant={tx.type === 'payment' || tx.type === 'adjustment_decrease' || tx.type === 'full_settlement' ? 'secondary' : 'outline'}
                            className={tx.type === 'payment' || tx.type === 'adjustment_decrease' || tx.type === 'full_settlement' ? 'text-green-700 dark:text-green-400 border-green-500' : (tx.type === 'new_credit' || tx.type === 'adjustment_increase' || tx.type === 'initial_balance' ? 'text-red-700 dark:text-red-400 border-red-500' : '')}
                     >
                       {transactionTypeLabels[tx.type] || tx.type}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{tx.description || "غير متاح"}</TableCell>
                  <TableCell className={`text-left rtl:text-right font-medium ${ (typeof tx.amount === 'number' && !isNaN(tx.amount)) ? (tx.type === 'payment' || tx.type === 'adjustment_decrease' || tx.type === 'full_settlement' ? 'text-green-600' : 'text-red-600') : 'text-muted-foreground'}`}>
                    { (typeof tx.amount === 'number' && !isNaN(tx.amount)) ? (tx.type === 'payment' || tx.type === 'adjustment_decrease' || tx.type === 'full_settlement' ? '-' : '+') : ''}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-left rtl:text-right font-semibold">{formatCurrency(tx.runningBalance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ) : (
        <p className="text-muted-foreground text-center py-4">{noTransactionsText}</p>
      )}
    </div>
  );
}
