
"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Using { params: any } as a workaround for the persistent type error
export default function LocaleFallbackMinimalSettingsPage({ params }: { params: any }) {
  const router = useRouter();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale';

  console.warn(
    `[Warning] MINIMAL Fallback page /src/app/[locale]/(app)/settings/page.tsx rendered for locale: '${locale}'. ` +
    `Redirecting to /settings. This path should ideally not be active.`
  );

  useEffect(() => {
    router.replace("/settings");
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>صفحة احتياطية للإعدادات</h1>
      <p>تتم الآن محاولة إعادة توجيهك إلى صفحة الإعدادات الرئيسية...</p>
      <p>المسار المطلوب كان: /{locale}/settings</p>
    </div>
  );
};
