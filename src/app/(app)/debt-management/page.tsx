
"use client";

import { DebtorForm } from "@/components/debt-management/debtor-form";
import { DebtorList } from "@/components/debt-management/debtor-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DebtManagementPage() {
  const pageTitle = "إدارة الديون"; 
  const addNewDebtorButtonText = "إضافة مدين جديد"; 

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-semibold text-foreground">{pageTitle}</h1>
        <DebtorForm 
          triggerButton={
            <Button>
              <PlusCircle className="ml-2 rtl:mr-0 rtl:ml-2 h-4 w-4" /> {addNewDebtorButtonText}
            </Button>
          }
        />
      </div>
      <DebtorList />
    </div>
  );
}
