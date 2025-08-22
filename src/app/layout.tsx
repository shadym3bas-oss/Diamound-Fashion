import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"

const cairo = Cairo({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "Diamond Fashion",
  description: "ERP System for Diamond Fashion Factory",
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
