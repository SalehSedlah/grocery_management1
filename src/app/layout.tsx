
import type { Metadata, Viewport } from 'next';
import './globals.css'; 
import { AuthProvider } from '@/contexts/auth-context';
import { DebtorsProvider } from '@/contexts/debtors-context';
import { ProductsProvider } from '@/contexts/products-context';
import { Toaster } from "@/components/ui/toaster";
import { Inter, Cairo } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cairo = Cairo({ subsets: ['arabic'], variable: '--font-cairo', weight: ['300', '400', '500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'DebtVision | رؤية الديون', 
  description: 'قم بإدارة ديونك برؤى مدعومة بالذكاء الاصطناعي.', 
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  // Default to Arabic font and RTL direction
  const fontClassName = `${cairo.variable} font-arabic`; 
  const direction = 'rtl';

  return (
    <html lang="ar" dir={direction} className={fontClassName}>
      <head />
      <body>
        <AuthProvider>
          <DebtorsProvider>
            <ProductsProvider>
              {children}
              <Toaster />
            </ProductsProvider>
          </DebtorsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
