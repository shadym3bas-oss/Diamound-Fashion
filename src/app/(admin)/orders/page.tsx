import { getSupabaseAdmin } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { OrdersTable } from "./_components/orders-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function OrdersPage() {
    const supabase = getSupabaseAdmin();
    const { data: orders, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        created_at,
        customers (name, phone),
        order_items (price, quantity)
      `)
      .order("created_at", { ascending: false });

    if (error) {
        console.error("Error loading orders:", JSON.stringify(error, null, 2));
        return <div>Error loading orders. Please check the logs.</div>
    }

    const ordersWithTotal = orders.map(o => ({
        ...o,
        total: o.order_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }));

    return (
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold self-start">الطلبات</h1>
                    <Link href="/orders/new">
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
                        <OrdersTable initialOrders={ordersWithTotal || []} />
                    </CardContent>
                </Card>
            </div>
    );
}
