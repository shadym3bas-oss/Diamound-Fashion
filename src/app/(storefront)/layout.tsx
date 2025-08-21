import Link from 'next/link';
import { Gem, LogIn, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-6 shadow-lg">
        <div className="container mx-auto px-6 flex justify-between items-center">
           <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold">✨ Diamond Fashion Store</h1>
          </Link>
          <nav className='flex items-center gap-4'>
            <Button variant="outline" className="text-purple-600 bg-white shadow hover:scale-105 transition-transform duration-300">
                <ShoppingCart className="ml-2 h-4 w-4" />
                السلة
            </Button>
            <Button asChild variant="ghost" className="hidden md:flex hover:bg-white/20 hover:text-white">
              <Link href="/login">
                دخول المسؤول
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Diamond Fashion. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-white transition">📘 فيسبوك</a>
            <a href="#" className="hover:text-white transition">📸 إنستجرام</a>
            <a href="#" className="hover:text-white transition">📱 واتساب</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
