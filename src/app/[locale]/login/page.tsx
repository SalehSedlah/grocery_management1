
"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Using { params: any } as a workaround for the persistent type error
export default function LocaleFallbackMinimalLoginPage({ params }: { params: any }) {
  const router = useRouter();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale';

  console.warn(
    `[Warning] MINIMAL Fallback page /src/app/[locale]/login/page.tsx rendered for locale: '${locale}'. ` +
    `Redirecting to /login. This path should ideally not be active.`
  );

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>صفحة احتياطية لتسجيل الدخول</h1>
      <p>تتم الآن محاولة إعادة توجيهك إلى صفحة تسجيل الدخول الرئيسية...</p>
      <p>المسار المطلوب كان: /{locale}/login</p>
    </div>
  );
};
