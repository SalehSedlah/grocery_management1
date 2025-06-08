
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorTitle = "حدث خطأ ما!";
  const errorMessage = "عذرًا، واجهنا مشكلة غير متوقعة.";
  const errorDigest = "معرف الخطأ:";
  const retryButton = "حاول مرة أخرى";

  useEffect(() => {
    // Log the error to an error reporting service or console
    console.error("Global Error Boundary Caught:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-destructive mb-4">{errorTitle}</h1>
            <p className="text-lg mb-2">{errorMessage}</p>
            {error?.digest && (
              <p className="text-sm text-muted-foreground mb-6">
                {errorDigest} {error.digest}
              </p>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              يرجى التحقق من سجلات الخادم (Vercel logs) لمزيد من التفاصيل حول هذا الخطأ.
            </p>
            <Button
              onClick={
                // Attempt to recover by trying to re-render the segment
                () => reset()
              }
            >
              {retryButton}
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
