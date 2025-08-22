
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase-client";
import { Skeleton } from "@/components/ui/skeleton";

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order_id');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            supabase.from('orders')
                .select('order_number')
                .eq('id', orderId)
                .single()
                .then(({ data, error }) => {
                    if (data) setOrder(data);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [orderId]);

    return (
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
                <CardTitle className="text-3xl">شكرًا لك على طلبك!</CardTitle>
                <CardDescription className="text-lg">
                    لقد تم استلام طلبك بنجاح.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <Skeleton className="h-7 w-1/2 mx-auto" />
                ) : order ? (
                     <p className="text-lg">
                        رقم طلبك هو: <strong className="font-mono text-primary">#{order.order_number}</strong>
                     </p>
                ) : (
                     <p className="text-muted-foreground">لم يتم العثور على رقم الطلب.</p>
                )}
               
                <p className="text-muted-foreground">
                    سنتواصل معك قريبًا لتأكيد تفاصيل الطلب والشحن.
                </p>
                 <Button asChild size="lg" className="mt-4">
                    <Link href="/">
                        العودة إلى الصفحة الرئيسية
                    </Link>
                </Button>
            </CardContent>
       </Card>
    )
}

export default function OrderSuccessPage() {
    return (
        <div className="container mx-auto px-6 py-20 flex items-center justify-center">
            <Suspense fallback={<Card className="w-full max-w-lg text-center p-8"><Skeleton className="h-48 w-full" /></Card>}>
              <OrderSuccessContent />
            </Suspense>
        </div>
    )
}
