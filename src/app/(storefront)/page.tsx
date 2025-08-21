import { getSupabaseAdmin } from '@/lib/supabase-client';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">منتجاتنا</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <Link href={`/products/${p.id}`} key={p.id} className="group">
                <div
                className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden flex flex-col h-full"
                >
                <div className="w-full h-56 relative">
                    <Image
                        src={p.image_url || `https://placehold.co/400x400.png`}
                        alt={p.name}
                        fill
                        className="object-cover"
                        data-ai-hint="fashion clothing"
                    />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{p.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 flex-grow">{p.description || "وصف المنتج هنا..."}</p>
                    <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-purple-600">{Number(p.price).toFixed(2)} ج.م</span>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                        أضف للسلة
                    </button>
                    </div>
                </div>
                </div>
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
