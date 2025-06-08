
"use client";

import type { Debtor, Transaction, TransactionType } from "@/types/debt";
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./auth-context";
import { toast } from "@/hooks/use-toast";
import { generateWhatsappReminder, type WhatsappReminderInput, prepareTransactionsForReminder } from "@/ai/flows/whatsapp-reminder-flow";
import { WhatsappReminderToastAction } from "@/components/debt-management/whatsapp-reminder-toast-action";
import { db } from "@/lib/firebase"; // Import Firestore instance
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  writeBatch,
  getDoc
} from "firebase/firestore";

interface DebtorsContextType {
  debtors: Debtor[];
  addDebtor: (debtorData: Omit<Debtor, "id" | "lastUpdated" | "userId" | "transactions" | "amountOwed"> & { initialAmount: number; debtReason?: string }) => Promise<void>;
  updateDebtorInfo: (debtorId: string, debtorInfo: Pick<Debtor, "name" | "phoneNumber" | "creditLimit" | "paymentHistory">) => Promise<void>;
  deleteDebtor: (id: string) => Promise<void>;
  addTransaction: (debtorId: string, transactionData: Omit<Transaction, "id" | "date">) => Promise<void>;
  loadingDebtors: boolean;
  getDebtorById: (id: string) => Debtor | undefined;
  calculateAmountOwed: (transactions: Transaction[]) => number;
}

const DebtorsContext = createContext<DebtorsContextType | undefined>(undefined);

const transactionTypeArabic: Record<TransactionType, string> = {
  payment: "دفعة",
  new_credit: "دين جديد",
  adjustment_increase: "تسوية (زيادة)",
  adjustment_decrease: "تسوية (نقصان)",
  full_settlement: "دفع كامل سداد",
  initial_balance: "رصيد افتتاحي", // Kept for displaying old data if any
};

const calculateAmountOwedInternal = (transactions: Transaction[]): number => {
  return transactions.reduce((balance, tx) => {
    let newBalance = balance;
    const amount = Number(tx.amount);

    if (isNaN(amount) || !isFinite(amount)) {
      console.error(`Invalid or non-finite amount in transaction, skipping:`, tx);
      return balance;
    }

    switch (tx.type) {
      case 'initial_balance': // if initial_balance is positive it adds to debt
      case 'new_credit':
      case 'adjustment_increase':
        newBalance += amount;
        break;
      case 'payment':
      case 'adjustment_decrease':
      case 'full_settlement':
        newBalance -= amount;
        break;
      default:
        return balance;
    }
    return parseFloat(newBalance.toFixed(2));
  }, 0);
};


export function DebtorsProvider({ children }: { children: ReactNode }) {
  const { user, businessName: appBusinessName } = useAuth();
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [loadingDebtors, setLoadingDebtors] = useState(true);

  const toastDebtorAddedTitle = "تمت إضافة المدين";
  const toastDebtorInfoUpdated = "تم تحديث معلومات المدين";
  const toastTransactionAdded = "تمت إضافة المعاملة";
  const whatsAppReminderPreparedTitle = (name: string) => `تذكير واتساب جاهز لـ ${name}`;
  const whatsAppReminderFailedTitle = "فشل إنشاء تذكير واتساب";
  const firestoreErrorToastTitle = "خطأ في قاعدة البيانات";


  useEffect(() => {
    if (!user) {
      setDebtors([]);
      setLoadingDebtors(false);
      return;
    }

    setLoadingDebtors(true);
    const debtorsColRef = collection(db, `users/${user.uid}/debtors`);
    const q = query(debtorsColRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDebtors: Debtor[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const transactions = (data.transactions || []).map((tx: any) => ({
          ...tx,
          date: (tx.date as Timestamp)?.toDate ? (tx.date as Timestamp).toDate().toISOString() : (typeof tx.date === 'string' ? tx.date : new Date().toISOString()),
          amount: Number(tx.amount) || 0,
        }));
        return {
          id: docSnap.id,
          ...data,
          transactions,
          lastUpdated: (data.lastUpdated as Timestamp)?.toDate ? (data.lastUpdated as Timestamp).toDate().toISOString() : (typeof data.lastUpdated === 'string' ? data.lastUpdated : new Date().toISOString()),
          amountOwed: calculateAmountOwedInternal(transactions),
        } as Debtor;
      });
      setDebtors(fetchedDebtors);
      setLoadingDebtors(false);
    }, (error) => {
      console.error("Error fetching debtors from Firestore:", error);
      toast({ title: firestoreErrorToastTitle, description: "فشل تحميل بيانات المدينين. " + error.message, variant: "destructive"});
      setLoadingDebtors(false);
    });

    return () => unsubscribe();
  }, [user]);


  const triggerWhatsappReminderIfNeeded = async (debtor: Debtor, wasOverLimitBefore?: boolean) => {
    const isCurrentlyOverLimit = debtor.amountOwed > debtor.creditLimit;
    
    let justExceededLimit = false;
    if (wasOverLimitBefore !== undefined) {
      justExceededLimit = wasOverLimitBefore === false && isCurrentlyOverLimit;
    }
    const newDebtorOverLimit = wasOverLimitBefore === undefined && isCurrentlyOverLimit;

    if ((justExceededLimit || newDebtorOverLimit) && debtor.phoneNumber) { 
      try {
        const transactionsForReminder = await prepareTransactionsForReminder(debtor.transactions || []);

        const input: WhatsappReminderInput = {
          debtorName: debtor.name,
          amountOwed: debtor.amountOwed,
          creditLimit: debtor.creditLimit,
          transactions: transactionsForReminder,
          debtorPhoneNumber: debtor.phoneNumber,
          businessName: appBusinessName || "متجرك", 
        };
        const result = await generateWhatsappReminder(input);
        setTimeout(() => {
          toast({
            title: whatsAppReminderPreparedTitle(debtor.name),
            description: result.whatsappMessage,
            duration: 20000, 
            action: <WhatsappReminderToastAction message={result.whatsappMessage} phoneNumber={debtor.phoneNumber} debtorName={debtor.name} />,
          });
        }, 0);
      } catch (error: any) {
        console.error("خطأ في إنشاء تذكير واتساب:", error);
        setTimeout(() => {
          toast({
            title: whatsAppReminderFailedTitle,
            description: error.message || "حدث خطأ غير متوقع.",
            variant: "destructive",
          });
        }, 0);
      }
    } else if (justExceededLimit || newDebtorOverLimit) {
        setTimeout(() => {
            toast({
                title: `تنبيه: ${debtor.name} تجاوز(ت) الحد الائتماني`,
                description: `المبلغ المستحق: ${debtor.amountOwed.toLocaleString('ar-EG')}، الحد الائتماني: ${debtor.creditLimit.toLocaleString('ar-EG')}. لا يوجد رقم هاتف مسجل لإرسال تذكير واتساب.`,
                variant: "default",
                duration: 10000,
            });
        }, 0);
    }
  };

  const addDebtor = async (fullDebtorData: Omit<Debtor, "id" | "lastUpdated" | "userId" | "transactions" | "amountOwed"> & { initialAmount: number; debtReason?: string }) => {
    if (!user) {
        toast({title: firestoreErrorToastTitle, description: "يجب تسجيل الدخول لإضافة مدين.", variant: "destructive"});
        return;
    }
    const { initialAmount, debtReason, ...debtorBaseData } = fullDebtorData;
    const initialTransactionAmount = Number(initialAmount) || 0;
    const newTransactionsForFirestore: (Omit<Transaction, 'id' | 'date'> & { date: Timestamp })[] = [];

    if (initialTransactionAmount > 0) {
      newTransactionsForFirestore.push({
        type: 'new_credit',
        amount: initialTransactionAmount,
        description: debtReason || undefined, // Use "undefined" so Firestore omits the field if empty
        date: Timestamp.now(), // Firestore Timestamp
      });
    }
    
    const newDebtorData = {
      ...debtorBaseData,
      userId: user.uid,
      lastUpdated: serverTimestamp(), // Firestore server timestamp for creation
      transactions: newTransactionsForFirestore.map(tx => ({ // Add temporary client-side IDs for display if needed before snapshot update
        ...tx,
        id: Date.now().toString() + Math.random().toString(36).substring(2,9) 
      })),
    };

    try {
      const debtorsColRef = collection(db, `users/${user.uid}/debtors`);
      // Firestore will generate the ID
      const docRef = await addDoc(debtorsColRef, newDebtorData);
      
      // Optimistically update UI or rely on onSnapshot
      // For now, we rely on onSnapshot to update the debtors list.
      // We can still show a toast.
      setTimeout(() => {
          toast({ title: toastDebtorAddedTitle, description: `تمت إضافة ${debtorBaseData.name}.` });
      }, 0);

      // Fetch the newly added debtor to trigger WhatsApp reminder if needed
      // This step is important if we want to use the exact data from Firestore including the generated ID
      const newDebtorSnapshot = await getDoc(docRef);
      if (newDebtorSnapshot.exists()) {
          const addedDebtor = {
              id: newDebtorSnapshot.id,
              ...newDebtorSnapshot.data(),
              transactions: (newDebtorSnapshot.data().transactions || []).map((tx: any) => ({
                  ...tx,
                  date: (tx.date as Timestamp)?.toDate ? (tx.date as Timestamp).toDate().toISOString() : new Date().toISOString(),
              })),
              lastUpdated: (newDebtorSnapshot.data().lastUpdated as Timestamp)?.toDate ? (newDebtorSnapshot.data().lastUpdated as Timestamp).toDate().toISOString() : new Date().toISOString(),
              amountOwed: calculateAmountOwedInternal(
                (newDebtorSnapshot.data().transactions || []).map((tx: any) => ({...tx, amount: Number(tx.amount) || 0 }))
              )
          } as Debtor;
          triggerWhatsappReminderIfNeeded(addedDebtor);
      }

    } catch (error: any) {
      console.error("Error adding debtor to Firestore:", error);
      toast({title: firestoreErrorToastTitle, description: "فشل إضافة المدين. " + error.message, variant: "destructive"});
    }
  };

  const updateDebtorInfo = async (debtorId: string, debtorInfo: Pick<Debtor, "name" | "phoneNumber" | "creditLimit" | "paymentHistory">) => {
     if (!user) {
        toast({title: firestoreErrorToastTitle, description: "يجب تسجيل الدخول لتحديث معلومات المدين.", variant: "destructive"});
        return;
    }
    const debtorDocRef = doc(db, `users/${user.uid}/debtors`, debtorId);
    try {
      const currentDebtor = debtors.find(d => d.id === debtorId);
      const wasOverLimitBeforeUpdate = currentDebtor ? currentDebtor.amountOwed > currentDebtor.creditLimit : undefined;

      await updateDoc(debtorDocRef, {
        ...debtorInfo,
        lastUpdated: serverTimestamp(),
      });
      setTimeout(() => {
          toast({title: toastDebtorInfoUpdated, description: `تم تحديث معلومات ${debtorInfo.name}.`});
      },0);

      // For WhatsApp reminder, we need the updated debtor object
      const updatedDebtorDoc = await getDoc(debtorDocRef);
      if(updatedDebtorDoc.exists()){
        const updatedData = updatedDebtorDoc.data();
        const transactions = (updatedData.transactions || []).map((tx: any) => ({
          ...tx,
          date: (tx.date as Timestamp)?.toDate ? (tx.date as Timestamp).toDate().toISOString() : new Date().toISOString(),
          amount: Number(tx.amount) || 0,
        }));
        const updatedDebtorForReminder = {
            id: updatedDebtorDoc.id,
            ...updatedData,
            transactions,
            amountOwed: calculateAmountOwedInternal(transactions),
            lastUpdated: (updatedData.lastUpdated as Timestamp)?.toDate ? (updatedData.lastUpdated as Timestamp).toDate().toISOString() : new Date().toISOString(),
        } as Debtor;
        triggerWhatsappReminderIfNeeded(updatedDebtorForReminder, wasOverLimitBeforeUpdate);
      }

    } catch (error: any) {
      console.error("Error updating debtor info in Firestore:", error);
      toast({title: firestoreErrorToastTitle, description: "فشل تحديث معلومات المدين. " + error.message, variant: "destructive"});
    }
  };


  const addTransaction = async (debtorId: string, transactionData: Omit<Transaction, "id" | "date">) => {
    if (!user) {
        toast({title: firestoreErrorToastTitle, description: "يجب تسجيل الدخول لإضافة معاملة.", variant: "destructive"});
        return;
    }
    const debtorDocRef = doc(db, `users/${user.uid}/debtors`, debtorId);
    try {
        const debtorSnap = await getDoc(debtorDocRef);
        if (!debtorSnap.exists()) {
            throw new Error("المدين غير موجود.");
        }
        const debtorData = debtorSnap.data() as Omit<Debtor, 'id' | 'amountOwed'>; // Firestore data before calculation
        const wasOverLimitBeforeTransaction = calculateAmountOwedInternal(
          (debtorData.transactions || []).map(tx => ({...tx, date: (tx.date as any)?.toDate ? (tx.date as any).toDate().toISOString() : tx.date }))
        ) > debtorData.creditLimit;


        const newTransactionForFirestore = {
            ...transactionData,
            id: Date.now().toString() + "_tx_" + Math.random().toString(36).substring(2, 7), // Client-side ID for array item
            date: Timestamp.now(), // Firestore Timestamp for transaction date
            amount: Number(transactionData.amount) || 0,
        };

        const updatedTransactions = [...(debtorData.transactions || []), newTransactionForFirestore];
        
        await updateDoc(debtorDocRef, {
            transactions: updatedTransactions,
            lastUpdated: serverTimestamp(),
        });

        setTimeout(() => {
          toast({ title: toastTransactionAdded, description: `تمت إضافة معاملة (${transactionTypeArabic[transactionData.type] || transactionData.type}) بمبلغ ${newTransactionForFirestore.amount.toLocaleString('ar-EG')} لـ ${debtorData.name}.` });
        }, 0);
        
        // For WhatsApp reminder, get updated debtor
        const updatedDebtorDoc = await getDoc(debtorDocRef);
        if(updatedDebtorDoc.exists()){
            const updatedData = updatedDebtorDoc.data();
             const transactionsForCalc = (updatedData.transactions || []).map((tx: any) => ({
                ...tx,
                date: (tx.date as Timestamp)?.toDate ? (tx.date as Timestamp).toDate().toISOString() : new Date().toISOString(),
                amount: Number(tx.amount) || 0,
            }));
            const debtorForReminder = {
                id: updatedDebtorDoc.id,
                ...updatedData,
                transactions: transactionsForCalc,
                amountOwed: calculateAmountOwedInternal(transactionsForCalc),
                lastUpdated: (updatedData.lastUpdated as Timestamp)?.toDate ? (updatedData.lastUpdated as Timestamp).toDate().toISOString() : new Date().toISOString(),
            } as Debtor;
            if (transactionData.type === 'new_credit' || transactionData.type === 'adjustment_increase') {
                triggerWhatsappReminderIfNeeded(debtorForReminder, wasOverLimitBeforeTransaction);
            }
        }

    } catch (error: any) {
      console.error("Error adding transaction in Firestore:", error);
      toast({title: firestoreErrorToastTitle, description: "فشل إضافة المعاملة. " + error.message, variant: "destructive"});
    }
  };

  const deleteDebtor = async (id: string) => {
    if (!user) {
        toast({title: firestoreErrorToastTitle, description: "يجب تسجيل الدخول لحذف مدين.", variant: "destructive"});
        return;
    }
    const debtorDocRef = doc(db, `users/${user.uid}/debtors`, id);
    try {
      await deleteDoc(debtorDocRef);
      // onSnapshot will update the local state
      // toast({ title: "تم حذف المدين", description: "تم حذف المدين بنجاح." }); // Toast is handled by DebtorList
    } catch (error: any) {
      console.error("Error deleting debtor from Firestore:", error);
      toast({title: firestoreErrorToastTitle, description: "فشل حذف المدين. " + error.message, variant: "destructive"});
    }
  };

  const getDebtorById = useCallback((id: string): Debtor | undefined => {
    return debtors.find(debtor => debtor.id === id);
  }, [debtors]);

  return (
    <DebtorsContext.Provider value={{ 
        debtors, 
        addDebtor, 
        updateDebtorInfo, 
        deleteDebtor, 
        addTransaction, 
        loadingDebtors, 
        getDebtorById,
        calculateAmountOwed: calculateAmountOwedInternal
    }}>
      {children}
    </DebtorsContext.Provider>
  );
}

export function useDebtors() {
  const context = useContext(DebtorsContext);
  if (context === undefined) {
    throw new Error("يجب استخدام useDebtors ضمن DebtorsProvider");
  }
  return context;
}
