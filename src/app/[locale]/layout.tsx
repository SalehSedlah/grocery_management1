import React from 'react';
import '../globals.css'; // Adjust path if needed

// ✅ Add generateStaticParams here
export async function generateStaticParams() {
  return [
    { locale: 'ar' },
    { locale: 'en' },
    // Add any supported locales here
  ];
}

export default function LocaleFallbackMinimalLayout({
  children,
  params // Use 'any'
}: {
  children: React.ReactNode;
  params: any;
}) {
  const locale = params && typeof params.locale === 'string' ? params.locale : 'unknown_locale_in_root_layout';
  console.warn(
    `[Warning] MINIMAL Fallback layout /src/app/[locale]/layout.tsx rendered for locale: '${locale}'. ` +
    `This path should ideally not be active. Ensure Next.js is routing to /app/layout.tsx.`
  );

  return (
    <html lang="ar" dir="rtl">
      <head />
      <body>
        {children}
      </body>
    </html>
  );
}
