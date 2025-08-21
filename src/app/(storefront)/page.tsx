"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase-client';
import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_urls: string[] | null;
  stock: number;
  sku: string;
};

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching products for storefront:", JSON.stringify(error, null, 2));
      } else {
        setProducts(data || []);
      }
    }
    fetchProducts();
  }, []);

  if (!products) {
    return <p className="text-center p-8">جاري تحميل المنتجات...</p>;
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast({
      title: "تمت الإضافة بنجاح!",
      description: `تمت إضافة "${product.name}" إلى السلة.`,
    });
  };

  return (
    <div className="container mx-auto px-6 py-10">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                اكتشف أحدث تشكيلاتنا
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
                تصاميم عصرية تلبي كل الأذواق بأفضل جودة.
            </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl shadow-sm border overflow-hidden flex flex-col group">
                <Link href={`/products/${p.id}`} className="block overflow-hidden">
                  <div className="w-full h-64 relative">
                      <Image
                          src={p.image_urls?.[0] || `https://placehold.co/400x400.png`}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint="fashion clothing"
                      />
                  </div>
                </Link>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-foreground">
                       <Link href={`/products/${p.id}`} className="hover:text-primary transition-colors">{p.name}</Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 flex-grow">{p.description || "وصف المنتج هنا..."}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold text-primary">{Number(p.price).toFixed(2)} ج.م</span>
                      <Button onClick={() => handleAddToCart(p)} disabled={p.stock === 0}>
                        أضف للسلة
                      </Button>
                    </div>
                </div>
            </div>
          ))}
        </div>
        {products.length === 0 && (
         <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">لا توجد منتجات متاحة للعرض حاليًا. يرجى العودة لاحقًا!</p>
         </div>
        )}
    </div>
  );
}
