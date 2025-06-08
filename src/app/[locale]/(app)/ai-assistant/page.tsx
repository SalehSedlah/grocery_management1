
"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Using { params: any } as a workaround for the persistent type error
export default function LocaleFallbackMinimalAiAssistantPage({ params }: { params: any }) {
  const router = useRouter();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale';

  console.warn(
    `[Warning] MINIMAL Fallback page /src/app/[locale]/(app)/ai-assistant/page.tsx rendered for locale: '${locale}'. ` +
    `Redirecting to /ai-assistant. This path should ideally not be active.`
  );

  useEffect(() => {
    router.replace("/ai-assistant");
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>صفحة احتياطية للمساعد الذكي</h1>
      <p>تتم الآن محاولة إعادة توجيهك إلى المساعد الذكي الرئيسي...</p>
      <p>المسار المطلوب كان: /{locale}/ai-assistant</p>
    </div>
  );
};
