
"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function OrderDetails() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
        fetchOrder();
    }
  }, [id]);

  async function fetchOrder() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, customers(name, phone), order_items(quantity, products(name, price))")
      .eq("id", id)
      .single();

    if (error) {
        console.error(error);
        setIsLoading(false);
    } else {
        const orderTotal = data.order_items.reduce((sum: number, item: any) => sum + (item.products.price * item.quantity), 0);
        setOrder({...data, total_amount: orderTotal});
        setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-1/2" />
            <div className="space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/4" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
            <div className="text-right">
                <Skeleton className="h-7 w-1/4" />
            </div>
        </div>
    );
  }

  if (!order) return <p className="text-center text-muted-foreground">لم يتم العثور على الطلب.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">تفاصيل الطلب #{order.order_number}</h1>
      
      <Card>
        <CardHeader>
            <CardTitle>بيانات العميل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-muted-foreground">
            <p><span className="font-semibold text-foreground">العميل:</span> {order.customers.name}</p>
            <p><span className="font-semibold text-foreground">الهاتف:</span> {order.customers.phone}</p>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle>المنتجات المطلوبة</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {order.order_items.map((item: any, i: number) => (
                <li key={i} className="flex justify-between items-center">
                  <span>
                    {item.products.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {item.quantity} × {Number(item.products.price).toFixed(2)} ج.م
                  </span>
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="flex justify-end font-bold text-lg">
                <p>الإجمالي: {Number(order.total_amount).toFixed(2)} ج.م</p>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
