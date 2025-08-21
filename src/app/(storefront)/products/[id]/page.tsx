"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PackageCheck, ShoppingCart } from "lucide-react";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  price: number | null;
  image_urls: string[] | null;
  colors: string[] | null;
  stock: number;
};

// A simple utility to check if a string is a valid color.
// This is basic and can be expanded.
const isColor = (strColor: string) => {
  const s = new Option().style;
  s.color = strColor.toLowerCase();
  return s.color !== '';
};

const ColorDisplay = ({ color }: { color: string }) => {
    const colorStyle = isColor(color) ? color : 'grey';
    return (
        <div className="flex items-center gap-2">
            <div 
                className="h-6 w-6 rounded-full border" 
                style={{ backgroundColor: colorStyle }}
                title={color}
            />
            <span className="capitalize">{color}</span>
        </div>
    );
};


export default function ProductDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { addToCart } = useCart();

    useEffect(() => {
        if (!id) return;
        
        async function fetchProduct() {
            setIsLoading(true);
            const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
            if (error || !data) {
                console.error(error);
            } else {
                setProduct(data);
            }
            setIsLoading(false);
        }
        fetchProduct();
    }, [id]);


    if (isLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                 <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card p-8 rounded-2xl shadow-lg border">
                    <Skeleton className="relative aspect-square rounded-xl" />
                    <div className="flex flex-col justify-center space-y-4">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-10 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-12 w-40" />
                    </div>
                 </div>
            </div>
        )
    }

    if (!product) {
        return <p className="text-center p-8 text-lg text-muted-foreground">لم يتم العثور على المنتج.</p>;
    }
    
    const handleAddToCart = () => {
        addToCart(product, 1);
        toast({
            title: "تمت الإضافة بنجاح!",
            description: `تمت إضافة "${product.name}" إلى السلة.`,
        });
    };

    const hasImages = product.image_urls && product.image_urls.length > 0;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 bg-card p-8 rounded-2xl shadow-lg border">
                <div className="relative">
                   {hasImages ? (
                        <Carousel className="w-full">
                            <CarouselContent>
                                {product.image_urls!.map((url, index) => (
                                    <CarouselItem key={index}>
                                        <div className="relative aspect-square">
                                            <Image 
                                                src={url}
                                                alt={`${product.name} - صورة ${index + 1}`}
                                                fill
                                                className="object-cover w-full h-full rounded-xl"
                                                data-ai-hint="fashion clothing"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="-right-12" />
                            <CarouselNext className="-left-12" />
                        </Carousel>
                    ) : (
                        <div className="relative aspect-square">
                            <Image 
                                src={`https://placehold.co/600x600.png`}
                                alt={product.name}
                                fill
                                className="object-cover w-full h-full rounded-xl"
                                data-ai-hint="fashion clothing"
                            />
                        </div>
                    )}
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-sm text-muted-foreground mb-2">SKU: {product.sku}</p>
                    <h1 className="text-4xl font-extrabold text-foreground mb-4">{product.name}</h1>
                    <p className="text-4xl font-bold text-primary mb-6">{Number(product.price).toFixed(2)} ج.م</p>
                    
                    <div className="flex items-center gap-2 mb-6">
                        <PackageCheck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-600">{product.stock > 0 ? `متوفر (${product.stock} قطعة)` : "نفدت الكمية"}</span>
                    </div>

                    <div className="prose prose-lg text-muted-foreground mb-6 max-w-none">
                        <p>{product.description || "لا يوجد وصف تفصيلي لهذا المنتج حاليًا."}</p>
                    </div>

                    {product.colors && product.colors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">الألوان المتاحة:</h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {product.colors.map(color => <ColorDisplay key={color} color={color} />)}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button size="lg" disabled={product.stock === 0} onClick={handleAddToCart} className="text-lg py-7 px-8">
                            <ShoppingCart className="ml-2 h-5 w-5" />
                            أضف إلى السلة
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
