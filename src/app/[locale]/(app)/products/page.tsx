
"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';

// Using { params: any } as a workaround for the persistent type error
export default function LocaleFallbackMinimalProductsPage({ params }: { params: any }) {
  const router = useRouter();
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale';

  console.warn(
    `[Warning] MINIMAL Fallback page /src/app/[locale]/(app)/products/page.tsx rendered for locale: '${locale}'. ` +
    `Redirecting to /products. This path should ideally not be active.`
  );

  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <h1>صفحة احتياطية للمنتجات</h1>
      <p>تتم الآن محاولة إعادة توجيهك إلى صفحة المنتجات الرئيسية...</p>
      <p>المسار المطلوب كان: /{locale}/products</p>
    </div>
  );
};
