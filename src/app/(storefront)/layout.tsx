import Link from 'next/link';
import { Gem, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
                <Gem className="h-6 w-6 text-primary"/>
            </div>
            <span className="text-xl font-bold text-gray-800">Diamond Fashion</span>
          </Link>
          <nav>
            <Button asChild variant="outline">
              <Link href="/login">
                <LogIn className="ml-2 h-4 w-4" />
                دخول المسؤول
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow bg-gray-50">{children}</main>
      <footer className="bg-white border-t">
        <div className="container mx-auto p-4 text-center text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Diamond Fashion. جميع الحقوق محفوظة.
        </div>
      </footer>
    </div>
  );
}
