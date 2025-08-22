"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase-client";
import { OrdersTable } from "./_components/orders-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  async function loadOrders() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        created_at,
        customer:customers (name, phone),
        order_items (price, quantity)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ variant: "destructive", title: "خطأ", description: error.message });
    } else {
      const ordersWithTotal = (data || []).map(o => ({
          ...o,
          total: o.order_items.reduce((sum: number, item: {price: number, quantity: number}) => sum + (item.price * item.quantity), 0)
      }));
      setOrders(ordersWithTotal);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);
  
  const TableSkeleton = () => (
    <div className="overflow-x-auto p-4">
        <div className="space-y-2">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
        </div>
    </div>
  );


  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <h1 className="text-2xl font-bold self-start">الطلبات</h1>
        <Link href="/admin/orders/new">
          <Button className="w-full md:w-auto">
            <PlusCircle className="ml-2 h-4 w-4" />
            إضافة طلب جديد
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الطلبات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? <TableSkeleton /> : <OrdersTable initialOrders={orders} />}
        </CardContent>
      </Card>
    </div>
  );
}
