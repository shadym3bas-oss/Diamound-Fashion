
import { getSupabaseAdmin } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PackageCheck, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ProductDetailsPage({ params }: { params: { id: string } }) {
    const supabase = getSupabaseAdmin();
    const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="bg-white rounded-2xl shadow-lg p-4">
                    <Image 
                        src={`https://placehold.co/600x600.png`}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="object-cover w-full h-full rounded-xl"
                        data-ai-hint="fashion clothing"
                    />
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{product.name}</h1>
                    <p className="text-muted-foreground mb-4">({product.sku})</p>
                    <p className="text-4xl font-bold text-primary mb-6">{Number(product.price).toFixed(2)} ج.م</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <PackageCheck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-600">{product.stock > 0 ? `متوفر (${product.stock} قطعة)` : "نفدت الكمية"}</span>
                    </div>

                    <div className="prose prose-lg text-gray-600 mb-6">
                        <p>وصف المنتج هنا. يمكنك إضافة تفاصيل أكثر عن المنتج، الخامات المستخدمة، تعليمات العناية، إلخ. هذا النص هو مثال مؤقت.</p>
                    </div>

                    <div className="flex gap-4">
                        <Button size="lg" disabled={product.stock === 0}>
                            <ShoppingCart className="ml-2 h-5 w-5" />
                            أضف إلى السلة
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
