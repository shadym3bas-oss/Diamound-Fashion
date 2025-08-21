
import { getSupabaseAdmin } from '@/lib/supabase-client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';

export default async function StorefrontPage() {
  const supabase = getSupabaseAdmin();
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .gt('stock', 0) // Only show products in stock
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching products for storefront:", JSON.stringify(error, null, 2));
    return <p className="text-center p-8">حدث خطأ أثناء تحميل المنتجات.</p>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-800">مجموعتنا الجديدة</h1>
        <p className="text-lg text-muted-foreground">اكتشف آخر صيحات الموضة من Diamond Fashion</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {products.map(product => (
          <Link key={product.id} href={`/products/${product.id}`} className="group">
            <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
              <CardHeader className="p-0">
                <div className="aspect-square w-full overflow-hidden">
                  <Image
                    src={`https://placehold.co/400x400.png`}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    data-ai-hint="fashion clothing"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg mb-1 group-hover:text-primary">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">({product.sku})</p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-xl font-bold text-primary">{Number(product.price).toFixed(2)} ج.م</p>
                <Button variant="outline">
                   <ShoppingCart className="ml-2 h-4 w-4" />
                   أضف للسلة
                </Button>
              </CardFooter>
            </Card>
          </Link>
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
