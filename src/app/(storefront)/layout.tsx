
"use client";

import Link from 'next/link';
import { Gem, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartProvider, useCart } from '@/context/cart-context';
import { Badge } from '@/components/ui/badge';

function StorefrontHeader() {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-card text-card-foreground py-4 shadow-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Gem className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Diamond Fashion</h1>
        </Link>
        <nav className='flex items-center gap-4'>
          <Button asChild>
            <Link href="/cart" className='relative'>
              <ShoppingCart className="ml-2 h-4 w-4" />
              <span>السلة</span>
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">{itemCount}</Badge>
              )}
            </Link>
          </Button>
          <Button asChild variant="outline" className="hidden md:flex">
            <Link href="/login">
              دخول المسؤول
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}


export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <StorefrontHeader />
        <main className="flex-grow">{children}</main>
        <footer className="bg-card text-muted-foreground py-6 mt-10 border-t">
          <div className="container mx-auto px-6 text-center">
            <p>© {new Date().getFullYear()} Diamond Fashion. جميع الحقوق محفوظة.</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
