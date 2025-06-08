"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function LocaleFallbackMinimalRootPage({ params }: { params: any }) {
  const router = useRouter();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale';

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>صفحة احتياطية</h1>
      <p>إذا رأيت هذه الصفحة، فهذا يعني أن هناك مشكلة في التوجيه بعد إزالة الترجمة.</p>
      <p>تتم الآن محاولة إعادة توجيهك...</p>
      <p>المسار المطلوب كان: /{locale}</p>
    </div>
  );
}
