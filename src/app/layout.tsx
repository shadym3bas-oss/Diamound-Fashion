import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';


const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['400', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Diamond Fashion',
  description: 'Factory ERP & Storefront',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
