
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface WhatsappReminderToastActionProps {
  message: string;
  phoneNumber?: string;
  debtorName: string;
}

export function WhatsappReminderToastAction({ message, phoneNumber, debtorName }: WhatsappReminderToastActionProps) {
  const { toast } = useToast(); // For "copied" confirmation

  const copyMessageButtonText = "نسخ الرسالة";
  const openWhatsAppButtonText = "فتح واتساب";
  const messageCopiedToastTitle = "تم النسخ!";
  const messageCopiedToastDescription = "تم نسخ رسالة التذكير إلى الحافظة.";


  const openWhatsApp = () => {
    if (phoneNumber) {
      const cleanedNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits
      // For international numbers, WhatsApp often expects the country code without '+' or '00'
      // This might need more sophisticated parsing based on your typical phone number formats.
      window.open(`https://wa.me/${cleanedNumber}?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    toast({
      title: messageCopiedToastTitle,
      description: messageCopiedToastDescription,
    });
  };

  return (
    <div className="flex flex-col items-stretch gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={copyMessage}>
        {copyMessageButtonText}
      </Button>
      {phoneNumber && (
        <Button variant="default" size="sm" onClick={openWhatsApp}>
          {openWhatsAppButtonText}
        </Button>
      )}
    </div>
  );
}
