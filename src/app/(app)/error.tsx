
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorTitle = "عفواً، حدث خطأ في هذا الجزء من التطبيق";
  const errorMessage = "لقد واجهنا مشكلة أثناء محاولة تحميل هذه الصفحة.";
  const errorDigest = "معرف الخطأ (إذا توفر):";
  const retryButton = "إعادة تحميل الصفحة";
  const moreDetails = "يرجى التحقق من سجلات الخادم (Vercel logs) لمزيد من التفاصيل الفنية حول هذا الخطأ.";

  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("App-Level Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-background text-foreground">
      <div className="text-center max-w-md p-8 border rounded-lg shadow-lg bg-card">
        <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-2xl font-semibold text-destructive mb-3">{errorTitle}</h1>
        <p className="text-muted-foreground mb-4">{errorMessage}</p>
        {error?.message && (
          <p className="text-sm text-muted-foreground bg-muted p-2 rounded-md mb-4">
            {error.message}
          </p>
        )}
        {error?.digest && (
          <p className="text-xs text-muted-foreground mb-1">
            {errorDigest} {error.digest}
          </p>
        )}
         <p className="text-xs text-muted-foreground mb-6">{moreDetails}</p>
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
          variant="default"
          size="lg"
        >
          {retryButton}
        </Button>
      </div>
    </div>
  );
}
